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
            System.out.println("Extracted public ID: " + publicId);

            if (publicId != null) {
                Map<String, Object> options = ObjectUtils.asMap(
                    "invalidate", true,
                    "resource_type", "image"
                );

                Map<?, ?> result = cloudinary.uploader().destroy(publicId, options);
                System.out.println("Cloudinary delete result: " + result);
            } else {
                System.out.println("Failed to extract public ID");
            }
        } catch (Exception e) {
            System.err.println("Error deleting image from Cloudinary:");
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
            if (uploadIndex == -1 || uploadIndex + 1 >= segments.length) return null;

            List<String> publicIdSegments = new ArrayList<>();

            for (int i = uploadIndex + 1; i < segments.length; i++) {
                String segment = segments[i];
                if (!segment.matches("^v\\d+$")) {
                    publicIdSegments.add(segment);
                }
            }

            String publicId = String.join("/", publicIdSegments);
            return publicId.replaceAll("\\.[^.]+$", "");
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}
