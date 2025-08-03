package com.travelquest.services;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import com.travelquest.dto.CollectionDTO;
import com.travelquest.exceptions.ResourceNotFoundException;

public interface CollectionService {
	
    CollectionDTO createCollection(String email, CollectionDTO dto,MultipartFile image) throws ResourceNotFoundException, IOException;
    CollectionDTO updateCollection(Long id, CollectionDTO dto,MultipartFile image, String email) throws AccessDeniedException,IOException;
    List<CollectionDTO> getCollectionsByUser(String email);
    CollectionDTO getCollectionById(Long id, String email) throws AccessDeniedException;
    void removeAdventureFromCollection(Long collectionId, Long adventureId, String email) throws AccessDeniedException ;
    void deleteCollection(Long collectionId, String email) throws AccessDeniedException;
    void addAdventureToCollection(Long collectionId, Long adventureId, String email) throws AccessDeniedException;
    Page<CollectionDTO> getCollectionsByUserPaginated(String email, int page, int size, String name);

}
