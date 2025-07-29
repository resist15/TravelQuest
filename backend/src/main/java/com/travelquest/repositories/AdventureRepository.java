package com.travelquest.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.travelquest.entity.Adventure;
import com.travelquest.entity.User;

public interface AdventureRepository extends JpaRepository<Adventure, Long> {

    // Non-paginated
    List<Adventure> findByUser(User user);

    // Paginated
    Page<Adventure> findByUser(User user, Pageable pageable);
    Page<Adventure> findByUserAndNameContainingIgnoreCase(User user, String location, Pageable pageable);

    // Find specific adventure
    Optional<Adventure> findByUserAndId(User user, Long id);

    // Recent adventures
    List<Adventure> findTop3ByOrderByCreatedAtDesc();
    
    
    @Query("SELECT COUNT(DISTINCT a.country) FROM Adventure a WHERE a.user.id = :userId AND a.country IS NOT NULL AND a.country <> ''")
    long countDistinctCountriesByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT a.region) FROM Adventure a WHERE a.user.id = :userId AND a.region IS NOT NULL AND a.region <> ''")
    long countDistinctRegionsByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT a.city) FROM Adventure a WHERE a.user.id = :userId AND a.city IS NOT NULL AND a.city <> ''")
    long countDistinctCitiesByUser(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(a) FROM Adventure a WHERE a.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

}
