package com.travelquest.services;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.travelquest.dto.AdventureDTO;

public interface AdventureService {
    AdventureDTO createAdventure(String email, AdventureDTO dto, List<MultipartFile> images);
    AdventureDTO updateAdventure(Long id, AdventureDTO dto, List<MultipartFile> newImages);
    void addImages(Long adventureId, List<MultipartFile> images, String email);
    void deleteImage(Long imageId, String email);
    List<AdventureDTO> getAdventuresByUser(String email);
    List<AdventureDTO> getAdventuresByUserPaginated(String email, int page, int size);
    AdventureDTO getAdventureById(Long id);
    //
    List<AdventureDTO> getRecentAdventures();
}
