package com.travelquest.services;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.travelquest.dto.AdventureDTO;
import com.travelquest.dto.DashboardStatsDTO;
import com.travelquest.exceptions.ResourceNotFoundException;

public interface AdventureService {
    AdventureDTO createAdventure(String email, AdventureDTO dto, List<MultipartFile> images) throws ResourceNotFoundException;
    AdventureDTO updateAdventure(Long id, AdventureDTO dto, List<MultipartFile> newImages,String email) throws ResourceNotFoundException;
    void deleteAdventure(Long adventureId, String email) throws ResourceNotFoundException;
    void addImages(Long adventureId, List<MultipartFile> images, String email) throws ResourceNotFoundException;
    void deleteImage(Long adventureId, String imageId, String email) throws ResourceNotFoundException;
    List<AdventureDTO> getAdventuresByUser(String email,boolean unassignedOnly) throws ResourceNotFoundException;
    AdventureDTO getAdventureByIdAndEmail(Long id,String email) throws ResourceNotFoundException;
	List<AdventureDTO> getAdventuresSorted(String email, String sortBy, String order, int page, int size, String search) throws ResourceNotFoundException;
    List<AdventureDTO> getAdventuresByCollectionId(Long id,String email);
	List<AdventureDTO> getPublicAdventures();
	AdventureDTO getPublicAdventure(Long id);
}
