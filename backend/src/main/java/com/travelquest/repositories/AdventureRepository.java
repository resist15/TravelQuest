package com.travelquest.repositories;

import com.travelquest.entity.Adventure;
import com.travelquest.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AdventureRepository extends JpaRepository<Adventure, Long> {
    List<Adventure> findByUser(User user);
    Page<Adventure> findByUser(User user, Pageable pageable);
    Page<Adventure> findByUserAndNameContainingIgnoreCase(User user, String location, Pageable pageable);
    List<Adventure> findByUserAndCollectionIsNull(User user);
    List<Adventure> findByPublicVisibility(boolean publicVisibility);
    Adventure findByPublicVisibilityAndId(boolean publicVisibility,Long id);
    List<Adventure> findAllByCollectionIdAndCollectionUserEmail(Long collectionId, String email);
}
