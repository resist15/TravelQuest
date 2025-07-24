package com.travelquest.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "adventure_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdventureImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adventure_id")
    private Adventure adventure;
}
