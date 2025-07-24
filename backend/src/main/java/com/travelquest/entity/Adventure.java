package com.travelquest.entity;

import com.travelquest.enums.Tag;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "adventures")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Adventure {

	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    private String name;

	    @Column(nullable = false)
	    private String location;

	    @Enumerated(EnumType.STRING)
	    @Column(nullable = false)
	    private Tag tag;
	    
	    @Column(nullable = false)
	    private String img;

	    @CreationTimestamp
		  
		@Column(updatable = false)
		private LocalDateTime createdAt;
		 
		@UpdateTimestamp 
		private LocalDateTime updatedAt;
		
		@ManyToOne(fetch = FetchType.LAZY, optional = false)
		@JoinColumn(name = "user_id", nullable = false)
		private User user;
			
}
