package com.travelquest.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.travelquest.entity.Adventure;
import com.travelquest.entity.User;

public interface AdventureRepository extends JpaRepository<Adventure, Long> {
    List<Adventure> findByUser(User user);
    Page<Adventure> findByUser(User user, Pageable pageable);
    Optional<Adventure> findByUserAndId(User user,Long id);
    List<Adventure> findTopThreeByOrderByCreatedAtDesc();
    Page<Adventure> findByUserAndNameContainingIgnoreCase(User user, String location, Pageable pageable);
    List<Adventure> findByUserAndCollectionIsNull(User user);
    List<Adventure> findAllByCollectionId(Long collectionId);
    List<Adventure> findByPublicVisibility(boolean publicVisibility);
    Adventure findByPublicVisibilityAndId(boolean publicVisibility,Long id);
}
