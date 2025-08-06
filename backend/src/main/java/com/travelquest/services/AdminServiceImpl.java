package com.travelquest.services;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelquest.dto.AdventureDTO;
import com.travelquest.dto.CollectionDTO;
import com.travelquest.dto.UserResponseDTO;
import com.travelquest.entity.Adventure;
import com.travelquest.entity.Collection;
import com.travelquest.entity.User;
import com.travelquest.repositories.AdventureRepository;
import com.travelquest.repositories.CollectionRepository;
import com.travelquest.repositories.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class AdminServiceImpl implements AdminService {

	@Autowired
    private AdventureRepository adventureRepository;
	@Autowired
    private CollectionRepository collectionRepository;
	@Autowired
    private UserRepository userRepository;
	@Autowired
	private AdventureServiceImpl adventureService;
	@Autowired
	private CollectionServiceImpl collectionService;
	
    @Autowired
    private ObjectMapper objectMapper;

    @Value("${maptiler.api.key}")
    private String maptilerApiKey;
    
	@Override
	public List<UserResponseDTO> getAllUsers() {
		return userRepository.findAll().stream().map(UserServiceImpl::mapToResponse).collect(Collectors.toList());
	}

	@Override
	public List<AdventureDTO> getAllAdventures() {
		return adventureRepository.findAll().stream().map(AdventureServiceImpl::toDTO).collect(Collectors.toList());
	}

	@Override
	public List<CollectionDTO> getAllCollection() {
		return collectionRepository.findAll().stream().map(CollectionServiceImpl::toDTO).collect(Collectors.toList());
	}
	
    @Transactional
    @Override
    public void deleteCollection(Long collectionId) throws AccessDeniedException{
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
        collectionService.deleteCollection(collectionId, collection.getUser().getEmail());
    }

    @Override
    @Transactional
    public void deleteAdventure(Long adventureId) {
        Adventure adventure = adventureRepository.findById(adventureId)
                .orElseThrow(() -> new RuntimeException("Adventure not found"));

        User user = userRepository.findByEmail(adventure.getUser().getEmail())
        		.orElseThrow(() -> new RuntimeException("User not found"));
        adventureService.deleteAdventure(adventureId, adventure.getUser().getEmail());
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
    	User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userId));
    	userRepository.delete(user);
    }

	@Override
    public AdventureDTO updateAdventure(Long id, AdventureDTO dto, List<MultipartFile> newImages) {
        Adventure adventure = adventureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adventure not found"));
        
        return adventureService.updateAdventure(id, dto, newImages, adventure.getUser().getEmail());
	}

	@Override
	public CollectionDTO updateCollection(Long id, CollectionDTO dto,MultipartFile image) throws IOException {
		Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Collection not found"));
		return collectionService.updateCollection(id,dto,image,collection.getUser().getEmail());
	}

	@Override
	public AdventureDTO getAdventureById(Long id) {
		Adventure adventure = adventureRepository.findById(id).orElseThrow(()-> new RuntimeException("Adventure not found"));
		return AdventureServiceImpl.toDTO(adventure);
	}

	@Override
	public CollectionDTO getCollectionById(Long id) {
		Collection collection = collectionRepository.findById(id).orElseThrow(()-> new RuntimeException("Collection not found"));
		return CollectionServiceImpl.toDTO(collection);
	}
	
    @Override
    public List<AdventureDTO> getAdventuresByCollectionIdS(Long id){
    	return adventureRepository.findAllByCollectionId(id).stream().map(AdventureServiceImpl::toDTO).collect(Collectors.toList());
    } 
    @Override
    @Transactional
    public void removeAdventureFromCollection(Long collectionId, Long adventureId) throws AccessDeniedException {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        Adventure adventure = adventureRepository.findById(adventureId)
                .orElseThrow(() -> new RuntimeException("Adventure not found"));

        if (collection.getAdventures().contains(adventure)) {
            collection.getAdventures().remove(adventure);
            adventure.setCollection(null);
            adventureRepository.save(adventure);
        }

        collectionRepository.save(collection);
    }

	@Override
	public void deleteImage(Long adventureId, String imageUrl) {
		Adventure adventure = adventureRepository.findById(adventureId).orElseThrow(()-> new RuntimeException("Adventure not found"));
		adventureService.deleteImage(adventureId, imageUrl, adventure.getUser().getEmail());
		
	}

}
