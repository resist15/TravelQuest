package com.travelquest.repositories;

import com.travelquest.entity.AdventureLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdventureLikeRepository extends JpaRepository<AdventureLike, Long> {
    boolean existsByAdventureIdAndUserId(Long adventureId, Long userId);
    long countByAdventureId(Long adventureId);
    void deleteByAdventureIdAndUserId(Long adventureId, Long userId);
}
