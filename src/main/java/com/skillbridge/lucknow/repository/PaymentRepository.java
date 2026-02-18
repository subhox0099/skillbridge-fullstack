package com.skillbridge.lucknow.repository;

import com.skillbridge.lucknow.entity.Payment;
import com.skillbridge.lucknow.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByProject(Project project);
}

