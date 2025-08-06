package com.travelquest.services;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
//import org.locationtech.jts.geom.GeometryFactory;
//import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelquest.dto.AdventureDTO;
import com.travelquest.dto.DashboardStatsDTO;
import com.travelquest.entity.Adventure;
import com.travelquest.entity.AdventureImage;
import com.travelquest.entity.DashboardStats;
import com.travelquest.entity.User;
import com.travelquest.exceptions.ResourceNotFoundException;
import com.travelquest.repositories.AdventureImageRepository;
import com.travelquest.repositories.AdventureRepository;
import com.travelquest.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdventureServiceImpl implements AdventureService {

    private final AdventureRepository adventureRepository;
    private final UserRepository userRepository;
    private final AdventureImageRepository imageRepository;
    private final CloudinaryService cloudinaryService;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${maptiler.api.key}")
    private String maptilerApiKey;

    @Override
    @Transactional
    public AdventureDTO createAdventure(String email, AdventureDTO dto, List<MultipartFile> images) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, String> geoData = reverseGeocode(dto.getLatitude(), dto.getLongitude());
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

        uploadImages(images, user.getId(), savedAdventure);
        updateUserStats(user);
        return toDTO(savedAdventure);
    }

    @Override
    @Transactional
    public AdventureDTO updateAdventure(Long id, AdventureDTO dto, List<MultipartFile> newImages,String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Adventure adventure = adventureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adventure not found"));
        
        if (!adventure.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        Map<String, String> geoData = reverseGeocode(dto.getLatitude(), dto.getLongitude());
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
            uploadImages(newImages, adventure.getUser().getId(), adventure);
        }

        Adventure updated = adventureRepository.save(adventure);
        updateUserStats(user);
        return toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteAdventure(Long adventureId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Adventure adventure = adventureRepository.findById(adventureId)
                .orElseThrow(() -> new RuntimeException("Adventure not found"));

        if (!adventure.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        List<AdventureImage> images = adventure.getImages();
        if (images != null && !images.isEmpty()) {
            for (AdventureImage image : images) {
                cloudinaryService.deleteImage(image.getUrl());
            }
            imageRepository.deleteAll(images);
        }

        adventureRepository.delete(adventure);
        updateUserStats(user);
    }

    @Override
    @Transactional
    public void addImages(Long adventureId, List<MultipartFile> images, String email) {
        Adventure adventure = adventureRepository.findById(adventureId)
                .orElseThrow(() -> new RuntimeException("Adventure not found"));

        if (!adventure.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        uploadImages(images, adventure.getUser().getId(), adventure);
    }

    @Override
    @Transactional
    public void deleteImage(Long adventureId, String imageUrl, String email) {
        Adventure adventure = adventureRepository.findById(adventureId)
                .orElseThrow(() -> new RuntimeException("Adventure not found"));

        if (!adventure.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        List<AdventureImage> images = adventure.getImages();
        if (images != null && !images.isEmpty()) {
            for (Iterator<AdventureImage> iterator = images.iterator(); iterator.hasNext(); ) {
                AdventureImage image = iterator.next();
                if (image.getUrl().equals(imageUrl)) {
                    System.out.println("Found image to delete");
                    cloudinaryService.deleteImage(image.getUrl());
                    iterator.remove();
                    break;
                }
            }
        }

        adventureRepository.save(adventure);
    }
    
    @Override
    public List<AdventureDTO> getAdventuresByUser(String email, boolean unassignedOnly) {
    	User user = userRepository.findByEmail(email)
    			.orElseThrow(() -> new RuntimeException("User not found"));
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
    public List<AdventureDTO> getAdventuresByCollectionId(Long id){
    	return adventureRepository.findAllByCollectionId(id).stream().map(this::toDTO).collect(Collectors.toList());
    }
    
    @Override
    public AdventureDTO getAdventureByIdAndEmail(Long id, String email) throws ResourceNotFoundException {
        Adventure adventure = adventureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adventure not found"));

        if (!adventure.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Unauthorized");
        }

        return this.toDTO(adventure);
    }
    
    @Override
    public List<AdventureDTO> getAdventuresByUserPaginated(String email, int page, int size, String location) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Adventure> result;

        if (location != null && !location.trim().isEmpty()) {
            result = adventureRepository.findByUserAndNameContainingIgnoreCase(user, location, pageable);
        } else {
            result = adventureRepository.findByUser(user, pageable);
        }

        return result.stream().map(this::toDTO).collect(Collectors.toList());
    }
    
    @Override
    public AdventureDTO getAdventureById(Long id) {
        Adventure adventure = adventureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adventure not found"));

        return toDTO(adventure);
    }

    private void uploadImages(List<MultipartFile> images, Long userId, Adventure adventure) {
        if (images == null || images.isEmpty()) {
            return; // No images to upload
        }
        for (MultipartFile image : images) {
            try {
                String url = cloudinaryService.uploadImage(image, userId.toString(), adventure.getId().toString());
                AdventureImage img = AdventureImage.builder()
                        .url(url)
                        .adventure(adventure)
                        .build();
                imageRepository.save(img);
                adventure.getImages().add(img);
            } catch (IOException e) {
                throw new RuntimeException("Image upload failed", e);
            }
        }
    }

    private AdventureDTO toDTO(Adventure adventure) {
        return AdventureDTO.builder()
                .id(adventure.getId())
                .name(adventure.getName())
                .location(adventure.getLocation())
                .latitude(adventure.getLatitude())
                .longitude(adventure.getLongitude())
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
                .build();
    }

	@Override
	public List<AdventureDTO> getAdventuresSorted(String email, String sortBy, String order, int page, int size, String search) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("User not found"));

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
	
	private void updateUserStats(User user) {
	    List<Adventure> adventures = adventureRepository.findByUser(user);

	    Set<String> cities = new HashSet<>();
	    Set<String> regions = new HashSet<>();
	    Set<String> countries = new HashSet<>();

	    for (Adventure adv : adventures) {
	        Map<String, String> geo = reverseGeocode(adv.getLatitude(), adv.getLongitude());

	        if (geo.get("city") != null) cities.add(geo.get("city"));
	        if (geo.get("region") != null) regions.add(geo.get("region"));
	        if (geo.get("country") != null) countries.add(geo.get("country"));
	    }

	    DashboardStats stats = DashboardStats.builder()
	        .totalAdventures(adventures.size())
	        .totalCities(cities.size())
	        .totalRegions(regions.size())
	        .totalCountries(countries.size())
	        .build();

	    user.setDashboardStats(stats);
	    userRepository.save(user);
	}

	@Override
	public DashboardStatsDTO getAdventureStats(String email) {
	    User user = userRepository.findByEmail(email)
	            .orElseThrow(() -> new RuntimeException("User not found"));
	    
	    return DashboardStatsDTO.builder()
	            .totalAdventures(user.getDashboardStats().getTotalAdventures())
	            .totalCities(user.getDashboardStats().getTotalCities())
	            .totalRegions(user.getDashboardStats().getTotalRegions())
	            .totalCountries(user.getDashboardStats().getTotalCountries())
	            .build();
	}

	private Map<String, String> reverseGeocode(double latitude, double longitude) {
	    Map<String, String> result = new HashMap<>();
	    result.put("city", null);
	    result.put("region", null);
	    result.put("country", null);

	    try {
	        String url = String.format(
	            "https://api.maptiler.com/geocoding/%f,%f.json?key=%s&language=en",
	            longitude, latitude, maptilerApiKey
	        );

	        HttpClient client = HttpClient.newHttpClient();
	        HttpRequest request = HttpRequest.newBuilder()
	                .uri(URI.create(url))
	                .GET()
	                .build();

	        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

	        if (response.statusCode() != 200) {
	            System.err.println("Non-200 response from MapTiler: " + response.body());
	            return result;
	        }

	        JsonNode root = objectMapper.readTree(response.body());
	        JsonNode features = root.get("features");

	        if (features != null && features.isArray()) {
	            for (JsonNode feature : features) {
	                JsonNode placeTypes = feature.get("place_type");
	                String name = feature.get("text").asText();

	                for (JsonNode type : placeTypes) {
	                    String typeValue = type.asText();
	                    switch (typeValue) {
	                    	case "place", "locality", "municipality", "localadmin" -> result.putIfAbsent("city", name);
	                        case "region", "subregion" -> result.putIfAbsent("region", name);
	                        case "country" -> result.putIfAbsent("country", name);
	                    }
	                }
	            }
	        }

	    } catch (Exception e) {
	        System.err.println("Reverse geocoding failed: " + e.getMessage());
	    }

	    return result;
	}

	@Override
	public List<AdventureDTO> getPublicAdventures() {
	    List<Adventure> adventures = adventureRepository.findByPublicVisibility(true);
		return adventures.stream().map(this::toDTO).collect(Collectors.toList());
	}

}
