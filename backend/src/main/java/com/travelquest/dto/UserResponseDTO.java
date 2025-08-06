package com.travelquest.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String profilePicture;
    private LocalDateTime joinedAt;
}