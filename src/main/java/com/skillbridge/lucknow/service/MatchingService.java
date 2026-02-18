package com.skillbridge.lucknow.service;

import com.skillbridge.lucknow.entity.*;
import com.skillbridge.lucknow.repository.ProjectSkillRepository;
import com.skillbridge.lucknow.repository.ReviewRepository;
import com.skillbridge.lucknow.repository.UserRepository;
import com.skillbridge.lucknow.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchingService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final ProjectSkillRepository projectSkillRepository;
    private final ReviewRepository reviewRepository;

    public MatchingService(UserRepository userRepository,
                           UserSkillRepository userSkillRepository,
                           ProjectSkillRepository projectSkillRepository,
                           ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.projectSkillRepository = projectSkillRepository;
        this.reviewRepository = reviewRepository;
    }

    public List<Map<String, Object>> matchCandidates(Project project, int limit) {
        List<ProjectSkill> projectSkills = projectSkillRepository.findByProject(project);
        Set<String> requiredSkillNames = projectSkills.stream()
                .map(ps -> ps.getSkill().getName())
                .collect(Collectors.toSet());

        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_STUDENT))
                .collect(Collectors.toList());

        List<Map<String, Object>> results = new ArrayList<>();
        for (User student : students) {
            List<UserSkill> userSkills = userSkillRepository.findByUser(student);
            Set<String> studentSkills = userSkills.stream()
                    .map(us -> us.getSkill().getName())
                    .collect(Collectors.toSet());

            if (studentSkills.isEmpty()) {
                continue;
            }

            long matched = studentSkills.stream()
                    .filter(requiredSkillNames::contains)
                    .count();

            double skillMatchPercentage = requiredSkillNames.isEmpty()
                    ? 0.0
                    : (matched * 100.0) / requiredSkillNames.size();

            double averageRating = reviewRepository.findByReviewee(student).stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);

            double locationScore = 0.0;
            if (project.getLocation() != null && student.getLocation() != null &&
                    project.getLocation().equalsIgnoreCase(student.getLocation())) {
                locationScore = 100.0;
            }

            double matchScore = (skillMatchPercentage * 0.5)
                    + (averageRating * 20 * 0.3) // rating 1-5 scaled to 0-100
                    + (locationScore * 0.2);

            Map<String, Object> entry = new HashMap<>();
            entry.put("studentId", student.getId());
            entry.put("fullName", student.getFullName());
            entry.put("matchScore", matchScore);
            entry.put("skillMatchPercentage", skillMatchPercentage);
            entry.put("averageRating", averageRating);
            entry.put("locationScore", locationScore);
            results.add(entry);
        }

        return results.stream()
                .sorted((a, b) -> Double.compare((Double) b.get("matchScore"), (Double) a.get("matchScore")))
                .limit(limit)
                .collect(Collectors.toList());
    }
}

