package com.travelquest.services;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.travelquest.dto.AdventureDTO;
import com.travelquest.dto.DashboardStatsDTO;
import com.travelquest.exceptions.ResourceNotFoundException;

public interface AdventureService {
    AdventureDTO createAdventure(String email, AdventureDTO dto, List<MultipartFile> images);
    AdventureDTO updateAdventure(Long id, AdventureDTO dto, List<MultipartFile> newImages,String email);
    public void deleteAdventure(Long adventureId, String email);
    void addImages(Long adventureId, List<MultipartFile> images, String email);
    void deleteImage(Long adventureId, String imageId, String email);
    List<AdventureDTO> getAdventuresByUser(String email,boolean unassignedOnly);
    AdventureDTO getAdventureByIdAndEmail(Long id,String email) throws ResourceNotFoundException;
    List<AdventureDTO> getAdventuresByUserPaginated(String email, int page, int size,String name);
    AdventureDTO getAdventureById(Long id);
	List<AdventureDTO> getAdventuresSorted(String email, String sortBy, String order, int page, int size, String search);
    List<AdventureDTO> getAdventuresByCollectionId(Long id,String email);
	DashboardStatsDTO getAdventureStats(String email);
	List<AdventureDTO> getPublicAdventures();
	AdventureDTO getPublicAdventure(Long id);
}
