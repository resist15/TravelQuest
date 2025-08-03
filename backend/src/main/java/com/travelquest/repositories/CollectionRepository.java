package com.travelquest.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.travelquest.entity.Adventure;
import com.travelquest.entity.Collection;
import com.travelquest.entity.User;

public interface CollectionRepository extends JpaRepository<Collection, Long> {
    Page<Collection> findByUser(User user, Pageable pageable);
    Page<Collection> findByUserAndNameContainingIgnoreCase(User user, String name, Pageable pageable);

}
