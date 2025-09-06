package com.travelquest.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdventureDTO {
    private Long id;
    private String name;
    private String location;
    private List<String> tags;
    private String description;
    private double rating;
    private String link;
    private boolean publicVisibility;
    private double latitude;
    private double longitude;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long collectionId;
    private long likesCount;
    private boolean likedByCurrentUser;
}
