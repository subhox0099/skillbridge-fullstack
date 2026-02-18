package com.skillbridge.lucknow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "business_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String companyName;

    @Column(length = 150)
    private String industry;

    @Column(length = 255)
    private String website;

    @Column(length = 255)
    private String address;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}

