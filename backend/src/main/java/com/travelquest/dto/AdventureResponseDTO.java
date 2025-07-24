package com.travelquest.dto;

import com.travelquest.enums.Tag;

import lombok.Data;

@Data
public class AdventureResponseDTO {

    private Long id;
    private String name;
    private String location;
    private Tag tag;
    private String img;
}
