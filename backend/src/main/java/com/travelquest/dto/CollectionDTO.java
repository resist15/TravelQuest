package com.travelquest.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CollectionDTO {
	
	private Long id;
	private String name;
	private String description;
	private String coverImage;
	private int adventureCount;
	private int durationInDays;
	private List<Long> existingAdventureIds;
	
}

