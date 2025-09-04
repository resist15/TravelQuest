package com.travelquest.services;

import com.travelquest.dto.DashboardStatsDTO;
import com.travelquest.entity.Adventure;
import com.travelquest.entity.DashboardStats;
import com.travelquest.entity.User;
import com.travelquest.exceptions.ResourceNotFoundException;
import com.travelquest.repositories.AdventureRepository;
import com.travelquest.repositories.UserRepository;
import com.travelquest.utils.map.MapUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final AdventureRepository adventureRepository;
    private final UserRepository userRepository;
    private final MapUtils mapUtils;

    @Transactional
    public void updateUserStats(User user) {
        List<Adventure> adventures = adventureRepository.findByUser(user);

        Set<String> cities = new HashSet<>();
        Set<String> regions = new HashSet<>();
        Set<String> countries = new HashSet<>();

        for (Adventure adv : adventures) {
            Map<String, String> geo = mapUtils.reverseGeocode(adv.getLatitude(), adv.getLongitude());

            if (geo.get("city") != null) cities.add(geo.get("city"));
            if (geo.get("region") != null) regions.add(geo.get("region"));
            if (geo.get("country") != null) countries.add(geo.get("country"));
        }

        DashboardStats stats = DashboardStats.builder()
                .totalAdventures(adventures.size())
                .totalCities(cities.size())
                .totalRegions(regions.size())
                .totalCountries(countries.size())
                .build();

        user.setDashboardStats(stats);
        userRepository.save(user);
    }

    @Override
    public DashboardStatsDTO getAdventureStats(String email) throws ResourceNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return DashboardStatsDTO.builder()
                .totalAdventures(user.getDashboardStats().getTotalAdventures())
                .totalCities(user.getDashboardStats().getTotalCities())
                .totalRegions(user.getDashboardStats().getTotalRegions())
                .totalCountries(user.getDashboardStats().getTotalCountries())
                .build();
    }
}
