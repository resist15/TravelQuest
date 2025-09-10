package com.travelquest.services;

import com.travelquest.dto.AdventureDTO;
import com.travelquest.dto.AdventurePublicDTO;
import com.travelquest.entity.Adventure;
import com.travelquest.entity.AdventureImage;
import com.travelquest.entity.AdventureLike;
import com.travelquest.entity.User;
import com.travelquest.exceptions.ResourceNotFoundException;
import com.travelquest.repositories.AdventureLikeRepository;
import com.travelquest.repositories.AdventureRepository;
import com.travelquest.repositories.UserRepository;
import com.travelquest.utils.map.MapUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdventureServiceImpl implements AdventureService {

    private final AdventureRepository adventureRepository;
    private final AdventureImageService adventureImageService;
    private final AdventureLikeRepository adventureLikeRepo;
    private final UserRepository userRepository;
    private final DashboardService dashboardService;
    private final MapUtils mapUtils;

    @Override
    @Transactional
    public AdventureDTO createAdventure(String email, AdventureDTO dto, List<MultipartFile> images) throws ResourceNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, String> geoData = mapUtils.reverseGeocode(dto.getLatitude(), dto.getLongitude());
        String resolvedLocation = geoData.getOrDefault("region", "Unknown");
        
        Adventure adventure = Adventure.builder()
                .name(dto.getName())
                .location(resolvedLocation)
                .tags(dto.getTags())
                .description(dto.getDescription())
                .link(dto.getLink())
                .publicVisibility(dto.isPublicVisibility())
                .rating(dto.getRating())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .user(user)
                .build();

        Adventure savedAdventure = adventureRepository.save(adventure);

        adventureImageService.uploadImages(images, user.getId(), savedAdventure);
        dashboardService.updateUserStats(user);
        return toDTO(savedAdventure);
    }

    @Override
    @Transactional
    public AdventureDTO updateAdventure(Long id, AdventureDTO dto, List<MultipartFile> newImages,String email) throws ResourceNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Adventure adventure = adventureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Adventure not found"));

        if (!adventure.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        Map<String, String> geoData = mapUtils.reverseGeocode(dto.getLatitude(), dto.getLongitude());
        String resolvedLocation = geoData.getOrDefault("region", "Unknown");
        
        adventure.setName(dto.getName());
        adventure.setLocation(resolvedLocation);
        adventure.setTags(dto.getTags());
        adventure.setDescription(dto.getDescription());
        adventure.setPublicVisibility(dto.isPublicVisibility());
        adventure.setLink(dto.getLink());
        adventure.setRating(dto.getRating());
        adventure.setUpdatedAt(LocalDateTime.now());
        adventure.setLatitude(dto.getLatitude());
        adventure.setLongitude(dto.getLongitude());

        if (newImages != null && !newImages.isEmpty()) {
            adventureImageService.uploadImages(newImages, adventure.getUser().getId(), adventure);
        }

        Adventure updated = adventureRepository.save(adventure);
        dashboardService.updateUserStats(user);
        return toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteAdventure(Long adventureId, String email) throws ResourceNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Adventure adventure = adventureRepository.findById(adventureId)
                .orElseThrow(() -> new ResourceNotFoundException("Adventure not found"));

        if (!adventure.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        List<AdventureImage> images = adventure.getImages();
        if (images != null && !images.isEmpty()) {
            for (AdventureImage image : images) {
                adventureImageService.deleteImageFromCloud(image.getUrl());
            }
            adventureImageService.deleteAllImages(images);
        }

        adventureRepository.delete(adventure);
        dashboardService.updateUserStats(user);
    }

    @Override
    @Transactional
    public void addImages(Long adventureId, List<MultipartFile> images, String email) throws ResourceNotFoundException {
        Adventure adventure = adventureRepository.findById(adventureId)
                .orElseThrow(() -> new ResourceNotFoundException("Adventure not found"));

        if (!adventure.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        adventureImageService.uploadImages(images, adventure.getUser().getId(), adventure);
    }

    @Override
    @Transactional
    public void deleteImage(Long adventureId, String imageUrl, String email) throws ResourceNotFoundException {
        Adventure adventure = adventureRepository.findById(adventureId)
                .orElseThrow(() -> new ResourceNotFoundException("Adventure not found"));

        if (!adventure.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        List<AdventureImage> images = adventure.getImages();
        if (images != null && !images.isEmpty()) {
            for (Iterator<AdventureImage> iterator = images.iterator(); iterator.hasNext(); ) {
                AdventureImage image = iterator.next();
                if (image.getUrl().equals(imageUrl)) {
                    System.out.println("Found image to delete");
                    adventureImageService.deleteImageFromCloud(image.getUrl());
                    iterator.remove(); // THIS is key - removes from list
                    break;
                }
            }
        }

        adventureRepository.save(adventure);
    }
    
    @Override
    public List<AdventureDTO> getAdventuresByUser(String email, boolean unassignedOnly) throws ResourceNotFoundException {
    	User user = userRepository.findByEmail(email)
    			.orElseThrow(() -> new ResourceNotFoundException("User not found"));
    	if(unassignedOnly) {
            return adventureRepository.findByUserAndCollectionIsNull(user).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
    	}
        return adventureRepository.findByUser(user).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdventureDTO> getAdventuresByCollectionId(Long id, String email) {
        return adventureRepository.findAllByCollectionIdAndCollectionUserEmail(id, email)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AdventureDTO getAdventureByIdAndEmail(Long id, String email) throws ResourceNotFoundException {
        Adventure adventure = adventureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Adventure not found"));

        if (!adventure.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        return this.toDTO(adventure);
    }

    private AdventureDTO toDTO(Adventure adventure) {
        long likesCount = adventureLikeRepo.countByAdventureId(adventure.getId());

        boolean likedByCurrentUser = false;
        try {
            String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            if (currentEmail != null) {
                User currentUser = userRepository.findByEmail(currentEmail).orElse(null);
                if (currentUser != null) {
                    likedByCurrentUser = adventureLikeRepo.existsByAdventureIdAndUserId(adventure.getId(), currentUser.getId());
                }
            }
        } catch (Exception e) {
            likedByCurrentUser = false;
        }

        return AdventureDTO.builder()
                .id(adventure.getId())
                .name(adventure.getName())
                .location(adventure.getLocation())
                .latitude(adventure.getLatitude())
                .longitude(adventure.getLongitude())
                .collectionId(
                        adventure.getCollection() != null
                                ? adventure.getCollection().getId()
                                : null)
                .tags(adventure.getTags())
                .publicVisibility(adventure.isPublicVisibility())
                .rating(adventure.getRating())
                .description(adventure.getDescription())
                .link(adventure.getLink())
                .imageUrls(
                        Objects.requireNonNullElse(adventure.getImages(), List.<AdventureImage>of())
                                .stream()
                                .map(AdventureImage::getUrl)
                                .collect(Collectors.toList())
                )
                .createdAt(adventure.getCreatedAt())
                .updatedAt(adventure.getUpdatedAt())
                .likedByCurrentUser(likedByCurrentUser)
                .likesCount(likesCount)
                .build();
    }

    private AdventurePublicDTO toPublicDTO(Adventure adventure) {
        long likesCount = adventureLikeRepo.countByAdventureId(adventure.getId());

        boolean likedByCurrentUser = false;
        try {
            String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            if (currentEmail != null) {
                User currentUser = userRepository.findByEmail(currentEmail).orElse(null);
                if (currentUser != null) {
                    likedByCurrentUser = adventureLikeRepo.existsByAdventureIdAndUserId(adventure.getId(), currentUser.getId());
                }
            }
        } catch (Exception e) {
            likedByCurrentUser = false;
        }

        return AdventurePublicDTO.builder()
                .id(adventure.getId())
                .name(adventure.getName())
                .location(adventure.getLocation())
                .latitude(adventure.getLatitude())
                .longitude(adventure.getLongitude())
                .tags(adventure.getTags())
                .rating(adventure.getRating())
                .description(adventure.getDescription())
                .link(adventure.getLink())
                .imageUrls(
                        Objects.requireNonNullElse(adventure.getImages(), List.<AdventureImage>of())
                                .stream()
                                .map(AdventureImage::getUrl)
                                .collect(Collectors.toList())
                )
                .createdAt(adventure.getCreatedAt())
                .updatedAt(adventure.getUpdatedAt())
                .author(adventure.getUser().getName())
                .likedByCurrentUser(likedByCurrentUser)
                .likesCount(likesCount)
                .build();
    }

    @Override
	public List<AdventureDTO> getAdventuresSorted(String email, String sortBy, String order, int page, int size, String search) throws ResourceNotFoundException {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		String sortField = switch (sortBy.toLowerCase()) {
			case "name", "rating", "createdat", "updatedat" -> sortBy;
			default -> "createdAt";
		};

		Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
		Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        Page<Adventure> result;

        if (search != null && !search.trim().isEmpty()) {
            result = adventureRepository.findByUserAndNameContainingIgnoreCase(user, search, pageable);
        } else {
            result = adventureRepository.findByUser(user, pageable);
        }
		return result
				.stream()
				.map(this::toDTO)
				.collect(Collectors.toList());
	}

	@Override
	public List<AdventurePublicDTO> getPublicAdventures() {
	    List<Adventure> adventures = adventureRepository.findByPublicVisibility(true);
		return adventures.stream().map(this::toPublicDTO).collect(Collectors.toList());
	}

	@Override
	public AdventurePublicDTO getPublicAdventure(Long id) {
		Adventure adventure = adventureRepository.findByPublicVisibilityAndId(true,id);
		return toPublicDTO(adventure);
	}

    @Transactional
    public void likeAdventure(Long adventureId, String email) throws ResourceNotFoundException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Adventure adventure = adventureRepository.findById(adventureId).orElseThrow(() -> new ResourceNotFoundException("Adventure not found"));

        boolean alreadyLiked = adventureLikeRepo.existsByAdventureIdAndUserId(adventureId, user.getId());
        if (alreadyLiked) {
            throw new IllegalStateException("User already liked this adventure");
        }

        AdventureLike like = new AdventureLike();
        like.setAdventure(adventure);
        like.setUser(user);
        adventureLikeRepo.save(like);
    }

    @Transactional
    public void unlikeAdventure(Long adventureId, String email) throws ResourceNotFoundException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!adventureLikeRepo.existsByAdventureIdAndUserId(adventureId, user.getId())) {
            throw new IllegalStateException("User has not liked this adventure");
        }

        adventureLikeRepo.deleteByAdventureIdAndUserId(adventureId, user.getId());
    }

    public Long getLikesCount(Long adventureId) {
        return adventureLikeRepo.countByAdventureId(adventureId);
    }

}
