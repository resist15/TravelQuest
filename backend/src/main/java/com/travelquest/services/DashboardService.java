package com.travelquest.services;

import com.travelquest.dto.DashboardStatsDTO;
import com.travelquest.entity.User;
import com.travelquest.exceptions.ResourceNotFoundException;

public interface DashboardService {
    DashboardStatsDTO getAdventureStats(String email) throws ResourceNotFoundException;
    void updateUserStats(User user);
}
