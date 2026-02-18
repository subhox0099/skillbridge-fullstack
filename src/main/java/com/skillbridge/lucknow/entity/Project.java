package com.skillbridge.lucknow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProjectStatus status;

    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private User businessOwner;

    @OneToMany(mappedBy = "project")
    @Builder.Default
    private Set<ProjectSkill> requiredSkills = new HashSet<>();

    @OneToMany(mappedBy = "project")
    @Builder.Default
    private Set<Application> applications = new HashSet<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

