package com.travelquest.services;

import com.travelquest.entity.Adventure;
import com.travelquest.entity.AdventureImage;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdventureImageService {
    void uploadImages(List<MultipartFile> images, Long userId, Adventure adventure);
    void deleteImageFromCloud(String url);
    void deleteAllImages(List<AdventureImage> images);
}
