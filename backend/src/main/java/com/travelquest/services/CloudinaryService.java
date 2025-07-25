package com.travelquest.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URL;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String userId, String adventureId) throws IOException {
        Map<String, Object> options = ObjectUtils.asMap(
                "folder", String.format("travelquest/%s/%s", userId, adventureId)
        );

        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
        return uploadResult.get("secure_url").toString();
    }

    public List<String> uploadImages(List<MultipartFile> files, String userId, String adventureId) throws IOException {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            urls.add(uploadImage(file, userId, adventureId));
        }
        return urls;
    }

    public void deleteImage(String url) {
        try {
            String publicId = extractPublicId(url);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void deleteImages(List<String> urls) {
        for (String url : urls) {
            deleteImage(url);
        }
    }

    private String extractPublicId(String url) {
        try {
            String path = new URL(url).getPath();
            String[] segments = path.split("/");
            int uploadIndex = Arrays.asList(segments).indexOf("upload");
            if (uploadIndex != -1) {
                String publicId = String.join("/", Arrays.copyOfRange(segments, uploadIndex + 1, segments.length));
                return publicId.replaceAll("\\.[^.]+$", "");
            }
        } catch (Exception e) {
        }
        return null;
    }
}
