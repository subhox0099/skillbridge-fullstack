package com.skillbridge.lucknow.service;

import com.skillbridge.lucknow.dto.ProjectRequest;
import com.skillbridge.lucknow.dto.ProjectResponse;
import com.skillbridge.lucknow.entity.*;
import com.skillbridge.lucknow.exception.BadRequestException;
import com.skillbridge.lucknow.exception.ResourceNotFoundException;
import com.skillbridge.lucknow.repository.ProjectRepository;
import com.skillbridge.lucknow.repository.ProjectSkillRepository;
import com.skillbridge.lucknow.repository.SkillRepository;
import com.skillbridge.lucknow.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final ProjectSkillRepository projectSkillRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository,
                          SkillRepository skillRepository,
                          ProjectSkillRepository projectSkillRepository,
                          UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.skillRepository = skillRepository;
        this.projectSkillRepository = projectSkillRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        User business = getCurrentUser();
        boolean isBusiness = business.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ROLE_BUSINESS);
        if (!isBusiness) {
            throw new BadRequestException("Only business users can create projects");
        }

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .status(ProjectStatus.OPEN)
                .businessOwner(business)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        projectRepository.save(project);

        int importance = 5;
        for (String skillName : request.getRequiredSkills()) {
            Skill skill = skillRepository.findByName(skillName)
                    .orElseGet(() -> skillRepository.save(
                            Skill.builder().name(skillName).build()
                    ));
            ProjectSkill ps = ProjectSkill.builder()
                    .project(project)
                    .skill(skill)
                    .importance(importance)
                    .build();
            projectSkillRepository.save(ps);
        }

        return toResponse(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> listOpenProjects() {
        return projectRepository.findByStatus(ProjectStatus.OPEN)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        return toResponse(project);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("No authenticated user");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    private ProjectResponse toResponse(Project project) {
        ProjectResponse res = new ProjectResponse();
        res.setId(project.getId());
        res.setTitle(project.getTitle());
        res.setDescription(project.getDescription());
        res.setLocation(project.getLocation());
        res.setStatus(project.getStatus());
        res.setCreatedAt(project.getCreatedAt());
        res.setBusinessOwnerId(project.getBusinessOwner() != null ? project.getBusinessOwner().getId() : null);
        List<String> skills = project.getRequiredSkills().stream()
                .map(ps -> ps.getSkill().getName())
                .collect(Collectors.toList());
        res.setRequiredSkills(skills);
        return res;
    }
}

