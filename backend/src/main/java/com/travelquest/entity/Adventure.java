package com.travelquest.entity;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;

import java.util.ArrayList;
import java.util.List;

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
    private String location;
    private double rating;
    private String description;
    private String link;

    @ElementCollection
    private List<String> tags;

    @Column(columnDefinition = "geometry(Point,4326)")
    private Point geoPoint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "adventure", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdventureImage> images = new ArrayList<>();
}
