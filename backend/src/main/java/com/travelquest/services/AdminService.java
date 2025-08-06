package com.travelquest.services;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.travelquest.dto.AdventureDTO;
import com.travelquest.dto.CollectionDTO;
import com.travelquest.dto.UserResponseDTO;

public interface AdminService {
	List<UserResponseDTO> getAllUsers();
	List<AdventureDTO> getAllAdventures();
	List<CollectionDTO> getAllCollection();
	void deleteAdventure(Long adventureId);
	void deleteCollection(Long collectionId);
	void deleteUser(Long userId);
    AdventureDTO updateAdventure(Long id, AdventureDTO dto, List<MultipartFile> newImages);
	CollectionDTO updateCollection(Long id, CollectionDTO dto,MultipartFile image) throws IOException;
	AdventureDTO getAdventureById(Long id);
	CollectionDTO getCollectionById(Long id);
    List<AdventureDTO> getAdventuresByCollectionIdS(Long id);
    void removeAdventureFromCollection(Long collectionId, Long adventureId) throws AccessDeniedException ;
    void deleteImage(Long adventureId, String imageUrl);

}