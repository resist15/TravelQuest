package com.travelquest.controllers;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.travelquest.dto.AdventureDTO;
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
            Authentication auth) {
        AdventureDTO saved = adventureService.createAdventure(auth.getName(), dto, images);
        return ResponseEntity.ok(saved);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdventureDTO> updateAdventure(
            @PathVariable Long id,
            @RequestPart("data") AdventureDTO dto,
            @RequestPart(value = "newImages", required = false) List<MultipartFile> newImages,
            Authentication auth) {
        AdventureDTO updated = adventureService.updateAdventure(id, dto, newImages);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> addImagesToAdventure(
            @PathVariable Long id,
            @RequestPart("images") List<MultipartFile> images,
            Authentication auth) {
        adventureService.addImages(id, images, auth.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteAdventureImage(
            @PathVariable Long imageId,
            Authentication auth) {
        adventureService.deleteImage(imageId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<AdventureDTO>> getAdventuresByUser(Authentication auth) {
        List<AdventureDTO> list = adventureService.getAdventuresByUser(auth.getName());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdventureDTO> getAdventureById(@PathVariable Long id) {
        return ResponseEntity.ok(adventureService.getAdventureById(id));
    }
    
    //
    @GetMapping("/recent")
    public ResponseEntity<List<AdventureDTO>> getRecentAdventures() {
        return ResponseEntity.ok(adventureService.getRecentAdventures());
    }

    @GetMapping("/sortedBy")
    public ResponseEntity<List<AdventureDTO>> getAdventuresSorted(
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String order,
            Authentication auth
    ) {
        List<AdventureDTO> sorted = adventureService.getAdventuresSorted(auth.getName(), sortBy, order);
        return ResponseEntity.ok(sorted);
    }
    //
}
