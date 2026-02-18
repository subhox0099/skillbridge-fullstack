package com.skillbridge.lucknow.repository;

import com.skillbridge.lucknow.entity.Role;
import com.skillbridge.lucknow.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);
}

