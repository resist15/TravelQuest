package com.travelquest.controllers;

import java.util.List;

import com.travelquest.dto.AdventurePublicDTO;
import org.springframework.http.HttpStatus;
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
import com.travelquest.dto.DashboardStatsDTO;
import com.travelquest.exceptions.ResourceNotFoundException;
import com.travelquest.services.AdventureService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/adventures")
@RequiredArgsConstructor
public class AdventureController {

    private final AdventureService adventureService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdventureDTO> createAdventure(
            @RequestPart("data") AdventureDTO dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication auth) throws ResourceNotFoundException {
        AdventureDTO saved = adventureService.createAdventure(auth.getName(), dto, images);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);

    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdventureDTO> updateAdventure(
            @PathVariable Long id,
            @RequestPart("data") AdventureDTO dto,
            @RequestPart(value = "newImages", required = false) List<MultipartFile> newImages,
            Authentication auth) throws ResourceNotFoundException {
        AdventureDTO updated = adventureService.updateAdventure(id, dto, newImages,auth.getName());
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping(value="{id}")
    public ResponseEntity<Void> deleteAdventure(@PathVariable Long id,Authentication auth) throws ResourceNotFoundException {
    	adventureService.deleteAdventure(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> addImagesToAdventure(
            @PathVariable Long id,
            @RequestPart("images") List<MultipartFile> images,
            Authentication auth) throws ResourceNotFoundException {
        adventureService.addImages(id, images, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/image/{id}")
    public ResponseEntity<Void> deleteAdventureImage(
    		@PathVariable Long id,
    		@RequestParam String imageUrl,
            Authentication auth) throws ResourceNotFoundException {
        adventureService.deleteImage(id,imageUrl, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<AdventureDTO>> getAdventuresByUser(@RequestParam(defaultValue = "false") boolean unassignedOnly, Authentication auth) throws ResourceNotFoundException {
        List<AdventureDTO> list = adventureService.getAdventuresByUser(auth.getName(),unassignedOnly);
        return ResponseEntity.ok(list);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AdventureDTO> getAdventureById(@PathVariable Long id,Authentication auth) throws ResourceNotFoundException {
        return ResponseEntity.ok(adventureService.getAdventureByIdAndEmail(id,auth.getName()));
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<AdventureDTO>> getAdventuresSorted(
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String order,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(required = false) String searchTerm,
            Authentication auth
    ) throws ResourceNotFoundException {
        List<AdventureDTO> sorted = adventureService.getAdventuresSorted(auth.getName(), sortBy, order, page, size, searchTerm);
        return ResponseEntity.ok(sorted);
    }
    
    @GetMapping("/feed")
    public ResponseEntity<List<AdventurePublicDTO>> getPublicAdventures(Authentication auth){
    	List<AdventurePublicDTO> publicAdventures = adventureService.getPublicAdventures();
    	return ResponseEntity.ok(publicAdventures);
    }

    @GetMapping("/feed/{id}")
    public ResponseEntity<AdventurePublicDTO> getPublicAdventures(@PathVariable Long id){
        AdventurePublicDTO publicAdventures = adventureService.getPublicAdventure(id);
    	return ResponseEntity.ok(publicAdventures);
    }
}
