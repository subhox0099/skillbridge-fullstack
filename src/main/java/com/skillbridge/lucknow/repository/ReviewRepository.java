package com.skillbridge.lucknow.repository;

import com.skillbridge.lucknow.entity.Project;
import com.skillbridge.lucknow.entity.Review;
import com.skillbridge.lucknow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByReviewee(User reviewee);

    List<Review> findByProject(Project project);
}

