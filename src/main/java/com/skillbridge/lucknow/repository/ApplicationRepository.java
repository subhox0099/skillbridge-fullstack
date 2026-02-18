package com.skillbridge.lucknow.repository;

import com.skillbridge.lucknow.entity.Application;
import com.skillbridge.lucknow.entity.Project;
import com.skillbridge.lucknow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByProject(Project project);

    List<Application> findByStudent(User student);

    Optional<Application> findByProjectAndStudent(Project project, User student);
}

