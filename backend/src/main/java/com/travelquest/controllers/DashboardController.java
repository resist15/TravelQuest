package com.travelquest.controllers;

import com.travelquest.dto.DashboardStatsDTO;
import com.travelquest.exceptions.ResourceNotFoundException;
import com.travelquest.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(Authentication auth) throws ResourceNotFoundException {
        return ResponseEntity.ok(dashboardService.getAdventureStats(auth.getName()));
    }
}
