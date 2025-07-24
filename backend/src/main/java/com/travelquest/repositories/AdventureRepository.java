package com.travelquest.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.travelquest.entity.Adventure;
import com.travelquest.enums.Tag;

public interface AdventureRepository extends JpaRepository<Adventure, Long> {
	
	List<Adventure> findByLocation(String location);
	List<Adventure> findByTag(Tag tag);
	List<Adventure> findByNameContainingIgnoreCase(String keyword);
	boolean existsByName(String name);

}
