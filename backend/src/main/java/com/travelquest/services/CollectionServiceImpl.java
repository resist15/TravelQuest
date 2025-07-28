package com.travelquest.services;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.travelquest.dto.CollectionDTO;
import com.travelquest.entity.Adventure;
import com.travelquest.entity.Collection;
import com.travelquest.entity.User;
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

    @Override
    @Transactional
    public CollectionDTO createCollection(String email, CollectionDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Adventure> adventures = adventureRepository.findAllById(dto.getExistingAdventureIds());

        Collection collection = Collection.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .coverImage(dto.getCoverImage())
                .user(user)
                .adventures(adventures)
                .build();

        adventures.forEach(adventure -> adventure.setCollection(collection));

        Collection saved = collectionRepository.save(collection);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public CollectionDTO updateCollection(Long id, CollectionDTO dto) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        collection.setName(dto.getName());
        collection.setDescription(dto.getDescription());
        collection.setCoverImage(dto.getCoverImage());
	    collection.setUpdatedAt(LocalDateTime.now());

        List<Adventure> adventures = adventureRepository.findAllById(dto.getExistingAdventureIds());
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
                .map(this::toDTO)
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
    public List<CollectionDTO> getCollectionsByUserPaginated(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Collection> pageResult = collectionRepository.findByUser(user, pageable);

        return pageResult.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
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
        
        if (!adventure.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }
     
        if (!collection.getAdventures().contains(adventure)) {
            collection.getAdventures().add(adventure);
            adventure.setCollection(collection);
            adventureRepository.save(adventure);  
            collectionRepository.save(collection); 
        }
    }

    
    private CollectionDTO toDTO(Collection collection) {
        return CollectionDTO.builder()
                .id(collection.getId())
                .name(collection.getName())
                .description(collection.getDescription())
                .coverImage(collection.getCoverImage())
                .userId(collection.getUser().getId())
                .createdAt(collection.getCreatedAt())
                .updatedAt(collection.getUpdatedAt())
                .adventureCount(collection.getAdventures().size())
                .existingAdventureIds(
                        collection.getAdventures().stream()
                                .map(Adventure::getId)
                                .collect(Collectors.toList())
                )
                
                .build();
    }
}
