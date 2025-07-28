package com.travelquest.services;

import java.nio.file.AccessDeniedException;
import java.util.List;

import com.travelquest.dto.CollectionDTO;

public interface CollectionService {
	
	CollectionDTO createCollection(String email, CollectionDTO dto);
    CollectionDTO updateCollection(Long id, CollectionDTO dto);
    List<CollectionDTO> getCollectionsByUser(String email);
    List<CollectionDTO> getCollectionsByUserPaginated(String email, int page, int size);
    CollectionDTO getCollectionById(Long id, String email) throws AccessDeniedException;
    void removeAdventureFromCollection(Long collectionId, Long adventureId, String email) throws AccessDeniedException ;
    void deleteCollection(Long collectionId, String email) throws AccessDeniedException;
    void addAdventureToCollection(Long collectionId, Long adventureId, String email) throws AccessDeniedException;
}
