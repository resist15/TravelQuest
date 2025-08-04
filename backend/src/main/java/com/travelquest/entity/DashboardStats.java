package com.travelquest.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class DashboardStats {
    private int totalAdventures;
    private int totalCities;
    private int totalRegions;
    private int totalCountries;
}
