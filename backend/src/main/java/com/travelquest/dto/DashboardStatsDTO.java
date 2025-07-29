package com.travelquest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalAdventures;
    private long countriesVisited;
    private long regionsVisited;
    private long citiesVisited;
}
