package com.travelquest.services;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.travelquest.dto.AdventureDTO;
import com.travelquest.entity.Adventure;
import com.travelquest.entity.AdventureImage;
import com.travelquest.entity.User;
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
    private final GeometryFactory geometryFactory = new GeometryFactory();

    @Override
    @Transactional
    public AdventureDTO createAdventure(String email, AdventureDTO dto, List<MultipartFile> images) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Point geoPoint = geometryFactory.createPoint(new Coordinate(dto.getLongitude(), dto.getLatitude()));
        geoPoint.setSRID(4326);

        Adventure adventure = Adventure.builder()
                .name(dto.getName())
                .location(dto.getLocation())
                .tags(dto.getTags())
                .description(dto.getDescription())
                .link(dto.getLink())
                .rating(dto.getRating())
                .geoPoint(geoPoint)
                .user(user)
                .build();

        Adventure savedAdventure = adventureRepository.save(adventure);

        uploadImages(images, user.getId(), savedAdventure);

        return toDTO(savedAdventure);
    }

    @Override
    @Transactional
    public AdventureDTO updateAdventure(Long id, AdventureDTO dto, List<MultipartFile> newImages) {
        Adventure adventure = adventureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adventure not found"));

        adventure.setName(dto.getName());
        adventure.setLocation(dto.getLocation());
        adventure.setTags(dto.getTags());
        adventure.setDescription(dto.getDescription());
        adventure.setLink(dto.getLink());
        adventure.setRating(dto.getRating());

        Point point = geometryFactory.createPoint(new Coordinate(dto.getLongitude(), dto.getLatitude()));
        point.setSRID(4326);
        adventure.setGeoPoint(point);

        if (newImages != null && !newImages.isEmpty()) {
            uploadImages(newImages, adventure.getUser().getId(), adventure);
        }

        Adventure updated = adventureRepository.save(adventure);
        return toDTO(updated);
    }

    @Override
    @Transactional
    public void addImages(Long adventureId, List<MultipartFile> images, String email) {
        Adventure adventure = adventureRepository.findById(adventureId)
                .orElseThrow(() -> new RuntimeException("Adventure not found"));

        if (!adventure.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        uploadImages(images, adventure.getUser().getId(), adventure);
    }

    @Override
    @Transactional
    public void deleteImage(Long imageId, String email) {
        AdventureImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        Adventure adventure = image.getAdventure();
        if (!adventure.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        cloudinaryService.deleteImage(image.getUrl());
        adventure.getImages().remove(image);
        imageRepository.delete(image);
    }

    @Override
    public List<AdventureDTO> getAdventuresByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return adventureRepository.findByUser(user).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

//    @Override
//    public List<AdventureDTO> getAdventuresByUserPaginated(String email, int page, int size, String name) {
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        Pageable pageable = PageRequest.of(page, size);
//        Page<Adventure> result = adventureRepository.findByUser(user, pageable);
//
//        return result.stream().map(this::toDTO).collect(Collectors.toList());
//    }
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

//    private AdventureDTO toDTO(Adventure adventure) {
//        return AdventureDTO.builder()
//                .id(adventure.getId())
//                .name(adventure.getName())
//                .location(adventure.getLocation())
//                .latitude(adventure.getGeoPoint().getY())
//                .longitude(adventure.getGeoPoint().getX())
//                .tags(adventure.getTags())
//                .rating(adventure.getRating())
//                .description(adventure.getDescription())
//                .link(adventure.getLink())
//                .imageUrls(
//                        adventure.getImages().stream()
//                                .map(AdventureImage::getUrl)
//                                .collect(Collectors.toList())
//                )
//                .build();
//    }
//    

    private AdventureDTO toDTO(Adventure adventure) {
        return AdventureDTO.builder()
                .id(adventure.getId())
                .name(adventure.getName())
                .location(adventure.getLocation())
                .latitude(adventure.getGeoPoint().getY())
                .longitude(adventure.getGeoPoint().getX())
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
                .build();
    }

    //
	@Override
	public List<AdventureDTO> getRecentAdventures() {
		return adventureRepository.findTopThreeByOrderByCreatedAtDesc().stream()
	            .map(this::toDTO)
	            .collect(Collectors.toList());
	}
    
}
