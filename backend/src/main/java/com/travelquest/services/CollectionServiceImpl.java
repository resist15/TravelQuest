package com.travelquest.services;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.travelquest.dto.AdventureDTO;
import com.travelquest.dto.CollectionDTO;
import com.travelquest.entity.Adventure;
import com.travelquest.entity.Collection;
import com.travelquest.entity.User;
import com.travelquest.exceptions.ResourceNotFoundException;
import com.travelquest.repositories.AdventureRepository;
import com.travelquest.repositories.CollectionRepository;
import com.travelquest.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CollectionServiceImpl implements CollectionService {

    private final CollectionRepository collectionRepository;
    private final UserRepository userRepository;
    private final AdventureRepository adventureRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public CollectionDTO createCollection(String email, CollectionDTO dto,MultipartFile image) throws ResourceNotFoundException, IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Adventure> adventures = adventureRepository.findAllById(dto.getExistingAdventureIds());
        
        for (Long adventureId : dto.getExistingAdventureIds()) {
            Adventure adventure = adventureRepository.findById(adventureId)
                .orElseThrow(() -> new RuntimeException("Adventure not found: " + adventureId));
            if (adventure.getCollection() != null) {
                throw new ResourceNotFoundException("Adventure already belongs to a collection: " + adventureId);
            }
        }
        String url = "/adventure_place.webp";
        
        if(image != null) {
        	url = cloudinaryService.uploadImage(image, user.getId().toString(), user.getId().toString());
        }
        
        Collection collection = Collection.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .coverImage(url)
                .durationInDays(dto.getDurationInDays())
                .user(user)
                .adventures(adventures)
                .build();

        adventures.forEach(adventure -> adventure.setCollection(collection));

        Collection saved = collectionRepository.save(collection);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public CollectionDTO updateCollection(Long id, CollectionDTO dto,MultipartFile image, String email) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        if (!collection.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }
        
        String url = "/adventure_place.webp";
        
        if(image != null) {
        	if(!collection.getCoverImage().equals(url)) {
        		cloudinaryService.deleteImage(collection.getCoverImage());
        	}
        	url = cloudinaryService.uploadImage(image, user.getId().toString(), user.getId().toString());
        }
        
        List<Long> advIds = new ArrayList<Long>();
        for(Adventure adv: collection.getAdventures()) {
        	advIds.add(adv.getId());
        }
        collection.setName(dto.getName());
        collection.setDescription(dto.getDescription());
        collection.setCoverImage(url);
        collection.setDurationInDays(dto.getDurationInDays());
        List<Adventure> adventures = adventureRepository.findAllById(advIds);
        adventures.forEach(a -> a.setCollection(collection));
        collection.getAdventures().clear();
        collection.getAdventures().addAll(adventures);

        return toDTO(collectionRepository.save(collection));
    }

    @Transactional
    @Override
    public void deleteCollection(Long collectionId, String email) throws AccessDeniedException {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        if (!collection.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        // Nullify collection reference in each adventure
        for (Adventure adventure : collection.getAdventures()) {
            adventure.setCollection(null);
            adventureRepository.save(adventure);
        }

        collectionRepository.delete(collection);
    }


    @Override
    public List<CollectionDTO> getCollectionsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return collectionRepository.findAll().stream()
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .map(CollectionServiceImpl::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CollectionDTO getCollectionById(Long id, String email) throws AccessDeniedException {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        if (!collection.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        return toDTO(collection);
    }
    
    @Override
    public List<CollectionDTO> getCollectionsByUserPaginated(String email, int page, int size, String name) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Collection> pageResult;

        if (name != null && !name.trim().isEmpty()) {
            pageResult = collectionRepository.findByUserAndNameContainingIgnoreCase(user, name, pageable);
        } else {
            pageResult = collectionRepository.findByUser(user, pageable);
        }

        return pageResult.stream().map(CollectionServiceImpl::toDTO).collect(Collectors.toList());
    }


    @Override
    @Transactional
    public void removeAdventureFromCollection(Long collectionId, Long adventureId, String email) throws AccessDeniedException {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        if (!collection.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        Adventure adventure = adventureRepository.findById(adventureId)
                .orElseThrow(() -> new RuntimeException("Adventure not found"));

        if (collection.getAdventures().contains(adventure)) {
            collection.getAdventures().remove(adventure);
            adventure.setCollection(null);
            adventureRepository.save(adventure);
        }

        collectionRepository.save(collection);
    }
  
    @Transactional
    @Override
    public void addAdventureToCollection(Long collectionId, Long adventureId, String email) throws AccessDeniedException {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        if (!collection.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        Adventure adventure = adventureRepository.findById(adventureId)
                .orElseThrow(() -> new RuntimeException("Adventure not found"));
        
        if (!adventure.getUser().getEmail().equals(email) && adventure.getCollection()==null) {
            throw new AccessDeniedException("Unauthorized");
        }
     
        if (!collection.getAdventures().contains(adventure)) {
            collection.getAdventures().add(adventure);
            adventure.setCollection(collection);
            adventureRepository.save(adventure);  
            collectionRepository.save(collection); 
        }
    }
    
    public static CollectionDTO toDTO(Collection collection) {
        return CollectionDTO.builder()
                .id(collection.getId())
                .name(collection.getName())
                .description(collection.getDescription())
                .coverImage(collection.getCoverImage())
                .durationInDays(collection.getDurationInDays())
                .adventureCount(collection.getAdventures().size())
                .existingAdventureIds(
                        collection.getAdventures().stream()
                                .map(Adventure::getId)
                                .collect(Collectors.toList())
                )
                .build();
    }
}
