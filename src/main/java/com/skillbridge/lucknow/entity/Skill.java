package com.skillbridge.lucknow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @OneToMany(mappedBy = "skill")
    @Builder.Default
    private Set<UserSkill> userSkills = new HashSet<>();

    @OneToMany(mappedBy = "skill")
    @Builder.Default
    private Set<ProjectSkill> projectSkills = new HashSet<>();
}

