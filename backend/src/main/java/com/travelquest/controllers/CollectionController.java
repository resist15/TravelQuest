package com.travelquest.controllers;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.travelquest.dto.AdventureDTO;
import com.travelquest.dto.CollectionDTO;
import com.travelquest.exceptions.ResourceNotFoundException;
import com.travelquest.services.AdventureService;
import com.travelquest.services.CollectionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;
    private final AdventureService adventureService;
 
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CollectionDTO> createCollection(
    		@RequestPart("data") CollectionDTO dto,
    		@RequestPart(value = "image", required = false) MultipartFile image,
            Authentication auth) throws ResourceNotFoundException, IOException {
        CollectionDTO created = collectionService.createCollection(auth.getName(), dto, image);
        return ResponseEntity.ok(created);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CollectionDTO> updateCollection(
            @PathVariable Long id,
    		@RequestPart("data") CollectionDTO dto,
    		@RequestPart(value = "image", required = false) MultipartFile image,
    		Authentication auth) throws IOException {
        return ResponseEntity.ok(collectionService.updateCollection(id, dto, image, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCollection(@PathVariable Long id, Authentication auth) throws AccessDeniedException {
        collectionService.deleteCollection(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{collectionId}/adventures/{adventureId}")
    public ResponseEntity<Void> removeAdventureFromCollection(
            @PathVariable Long collectionId,
            @PathVariable Long adventureId,
            Authentication auth
    ) throws AccessDeniedException {
        collectionService.removeAdventureFromCollection(collectionId, adventureId, auth.getName());
        return ResponseEntity.noContent().build();
    }


    @GetMapping
    public ResponseEntity<List<CollectionDTO>> getAllCollections(Authentication auth) {
        return ResponseEntity.ok(collectionService.getCollectionsByUser(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollectionDTO> getCollectionById(@PathVariable Long id, Authentication auth) throws AccessDeniedException {
        return ResponseEntity.ok(collectionService.getCollectionById(id, auth.getName()));
    }
    
    @GetMapping("/{id}/adventures")
    public ResponseEntity<List<AdventureDTO>> getAdventuresByCollection(@PathVariable Long id, Authentication auth) throws AccessDeniedException {
        return ResponseEntity.ok(adventureService.getAdventuresByCollectionId(id,auth.getName()));
    }
    
    @PostMapping("/{collectionId}/adventures/{adventureId}")
    public ResponseEntity<Void> addAdventureToCollection(
            @PathVariable Long collectionId,
            @PathVariable Long adventureId,
            Authentication auth
    ) throws AccessDeniedException {
        collectionService.addAdventureToCollection(collectionId, adventureId, auth.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<CollectionDTO>> getMyCollectionsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(required = false) String searchTerm,
            Authentication auth
    ) {
        List<CollectionDTO> collections = collectionService.getCollectionsByUserPaginated(auth.getName(), page, size, searchTerm);
        return ResponseEntity.ok(collections);
    }

}
