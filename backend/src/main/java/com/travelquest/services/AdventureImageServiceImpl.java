package com.travelquest.services;

import com.travelquest.entity.Adventure;
import com.travelquest.entity.AdventureImage;
import com.travelquest.repositories.AdventureImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdventureImageServiceImpl implements AdventureImageService{

    private final CloudinaryService cloudinaryService;
    private final AdventureImageRepository adventureImageRepository;

    @Override
    public void uploadImages(List<MultipartFile> images, Long userId, Adventure adventure) {
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
                adventureImageRepository.save(img);
                adventure.getImages().add(img);
            } catch (IOException e) {
                throw new RuntimeException("Image upload failed", e);
            }
        }
    }

    @Override
    public void deleteImageFromCloud(String url) {
        cloudinaryService.deleteImage(url);
    }

    @Override
    public void deleteAllImages(List<AdventureImage> images) {
        adventureImageRepository.deleteAll(images);
    }
}
