package com.travelquest.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.travelquest.entity.Collection;
import com.travelquest.entity.User;

public interface CollectionRepository extends JpaRepository<Collection, Long> {
    Page<Collection> findByUser(User user, Pageable pageable);
}
