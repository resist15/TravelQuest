package com.travelquest.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.travelquest.entity.Adventure;
import com.travelquest.entity.User;

public interface AdventureRepository extends JpaRepository<Adventure, Long> {
    List<Adventure> findByUser(User user);
    Page<Adventure> findByUser(User user, Pageable pageable);
}
