package com.skillbridge.lucknow.controller;

import com.skillbridge.lucknow.dto.ProjectRequest;
import com.skillbridge.lucknow.dto.ProjectResponse;
import com.skillbridge.lucknow.entity.Project;
import com.skillbridge.lucknow.exception.ResourceNotFoundException;
import com.skillbridge.lucknow.repository.ProjectRepository;
import com.skillbridge.lucknow.service.MatchingService;
import com.skillbridge.lucknow.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectRepository projectRepository;
    private final MatchingService matchingService;

    public ProjectController(ProjectService projectService,
                             ProjectRepository projectRepository,
                             MatchingService matchingService) {
        this.projectService = projectService;
        this.projectRepository = projectRepository;
        this.matchingService = matchingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.createProject(request));
    }

    @GetMapping("/open")
    public ResponseEntity<List<ProjectResponse>> listOpen() {
        return ResponseEntity.ok(projectService.listOpenProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @GetMapping("/{id}/matches")
    @PreAuthorize("hasRole('BUSINESS') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getMatches(@PathVariable Long id,
                                                                @RequestParam(defaultValue = "10") int limit) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        return ResponseEntity.ok(matchingService.matchCandidates(project, limit));
    }
}

