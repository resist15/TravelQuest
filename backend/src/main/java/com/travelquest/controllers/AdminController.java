package com.travelquest.controllers;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.travelquest.dto.AdventureDTO;
import com.travelquest.dto.CollectionDTO;
import com.travelquest.dto.UserResponseDTO;
import com.travelquest.services.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
	
    // View all adventures
    @GetMapping("/adventures")
    public List<AdventureDTO> getAllAdventures() {
        return adminService.getAllAdventures();
    }

    // View all collections
    @GetMapping("/collections")
    public List<CollectionDTO> getAllCollections() {
        return adminService.getAllCollection();
    }

    // View all adventures
    @GetMapping("/adventures/{id}")
    public AdventureDTO getAdventure(@PathVariable Long id) {
        return adminService.getAdventureById(id);
    }

    // View all collections
    @GetMapping("/collections/{id}")
    public CollectionDTO getAllCollections(@PathVariable Long id) {
        return adminService.getCollectionById(id);
    }
    
    // View all collections
    @GetMapping("/collections/{id}/adventures")
    public List<AdventureDTO> getAdventuresByCollectionId(@PathVariable Long id) {
        return adminService.getAdventuresByCollectionIdS(id);
    }

    // View all users
    @GetMapping("/users")
    public List<UserResponseDTO> getAllUsers() {
        return adminService.getAllUsers();
    }
    // Delete user by ID
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    	adminService.deleteUser(id);
        return ResponseEntity.ok().body("User deleted");
    }
    
    // Delete adventures by ID
    @DeleteMapping("/adventures/{id}")
    public ResponseEntity<?> deleteAdventure(@PathVariable Long id) {
    	adminService.deleteAdventure(id);
        return ResponseEntity.ok().body("Adventure deleted");
    }
    
    // Delete collections by ID
    @DeleteMapping("/collections/{id}")
    public ResponseEntity<?> deleteCollection(@PathVariable Long id) {
    	adminService.deleteCollection(id);
        return ResponseEntity.ok().body("Collection deleted");
    }
    
    // Update adventures by ID
    @PutMapping(value = "/adventures/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdventureDTO> updateAdventure(
            @PathVariable Long id,
            @RequestPart("data") AdventureDTO dto,
            @RequestPart(value = "newImages", required = false) List<MultipartFile> newImages,
            Authentication auth){
    	return ResponseEntity.ok(adminService.updateAdventure(id,dto,newImages));
    }
    
    // Update collections by ID
    @PutMapping(value = "/collections/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CollectionDTO> updateCollection(
            @PathVariable Long id,
    		@RequestPart("data") CollectionDTO dto,
    		@RequestPart(value = "image", required = false) MultipartFile image,
    		Authentication auth) throws IOException {
        return ResponseEntity.ok(adminService.updateCollection(id, dto, image));
    }
    
    @DeleteMapping("/collections/{collectionId}/adventures/{adventureId}")
    public ResponseEntity<Void> removeAdventureFromCollection(
            @PathVariable Long collectionId,
            @PathVariable Long adventureId,
            Authentication auth
    ) throws AccessDeniedException {
        adminService.removeAdventureFromCollection(collectionId, adventureId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/adventures/image/{id}")
    public ResponseEntity<Void> deleteAdventureImage(
    		@PathVariable Long id,
    		@RequestParam String imageUrl,
            Authentication auth) {
        adminService.deleteImage(id,imageUrl);
        return ResponseEntity.noContent().build();
    }
}
