package com.skillbridge.lucknow.repository;

import com.skillbridge.lucknow.entity.User;
import com.skillbridge.lucknow.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    List<UserSkill> findByUser(User user);
}

