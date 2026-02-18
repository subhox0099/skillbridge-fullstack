package com.skillbridge.lucknow.repository;

import com.skillbridge.lucknow.entity.Project;
import com.skillbridge.lucknow.entity.ProjectSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectSkillRepository extends JpaRepository<ProjectSkill, Long> {

    List<ProjectSkill> findByProject(Project project);
}

