package com.skillbridge.lucknow.service;

import com.skillbridge.lucknow.dto.AuthRequest;
import com.skillbridge.lucknow.dto.AuthResponse;
import com.skillbridge.lucknow.dto.RegisterRequest;
import com.skillbridge.lucknow.entity.Role;
import com.skillbridge.lucknow.entity.RoleName;
import com.skillbridge.lucknow.entity.User;
import com.skillbridge.lucknow.exception.BadRequestException;
import com.skillbridge.lucknow.repository.RoleRepository;
import com.skillbridge.lucknow.repository.UserRepository;
import com.skillbridge.lucknow.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        RoleName roleName;
        switch (request.getRole().toUpperCase()) {
            case "STUDENT" -> roleName = RoleName.ROLE_STUDENT;
            case "BUSINESS" -> roleName = RoleName.ROLE_BUSINESS;
            case "ADMIN" -> roleName = RoleName.ROLE_ADMIN;
            default -> throw new BadRequestException("Invalid role: " + request.getRole());
        }

        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(roleName).build()
                ));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .location(request.getLocation())
                .roles(Collections.singleton(role))
                .build();

        userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail());
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail());
    }
}

