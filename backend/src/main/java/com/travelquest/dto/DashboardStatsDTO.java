package com.travelquest.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDTO {
    private int totalAdventures;
    private int totalCities;
    private int totalRegions;
    private int totalCountries;
}
