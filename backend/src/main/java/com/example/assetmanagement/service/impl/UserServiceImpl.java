package com.example.assetmanagement.service.impl;

import com.example.assetmanagement.dto.request.UserRequest;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.dto.response.UserResponse;
import com.example.assetmanagement.entity.Base;
import com.example.assetmanagement.entity.User;
import com.example.assetmanagement.enums.Role;
import com.example.assetmanagement.exception.BusinessRuleException;
import com.example.assetmanagement.exception.DuplicateResourceException;
import com.example.assetmanagement.exception.ResourceNotFoundException;
import com.example.assetmanagement.repository.BaseRepository;
import com.example.assetmanagement.repository.UserRepository;
import com.example.assetmanagement.service.AuditLogService;
import com.example.assetmanagement.service.UserService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BaseRepository baseRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserServiceImpl(
            UserRepository userRepository,
            BaseRepository baseRepository,
            PasswordEncoder passwordEncoder,
            AuditLogService auditLogService
    ) {
        this.userRepository = userRepository;
        this.baseRepository = baseRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new DuplicateResourceException("User already exists with email: " + request.getEmail());
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BusinessRuleException("Password is required for new user creation");
        }

        Base base = null;
        if (request.getRole() == Role.ADMIN) {
            // ADMIN base_id MUST be null
            base = null;
        } else if (request.getRole() == Role.BASE_COMMANDER) {
            if (request.getBaseId() == null) {
                throw new BusinessRuleException("BASE_COMMANDER must be assigned to exactly one base");
            }
            base = baseRepository.findById(request.getBaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Base not found with id: " + request.getBaseId()));
        } else if (request.getBaseId() != null) {
            base = baseRepository.findById(request.getBaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Base not found with id: " + request.getBaseId()));
        }

        User user = new User(
                null,
                request.getName().trim(),
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole(),
                base,
                request.getActive() != null ? request.getActive() : true
        );

        User saved = userRepository.save(user);
        auditLogService.log("USER_CREATED", "USER", saved.getId(), "Created user " + saved.getName() + " with role " + saved.getRole());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (userRepository.existsByEmailAndIdNot(request.getEmail().trim().toLowerCase(), id)) {
            throw new DuplicateResourceException("Another user already exists with email: " + request.getEmail());
        }

        Base base = null;
        if (request.getRole() == Role.ADMIN) {
            base = null;
        } else if (request.getRole() == Role.BASE_COMMANDER) {
            if (request.getBaseId() == null) {
                throw new BusinessRuleException("BASE_COMMANDER must be assigned to exactly one base");
            }
            base = baseRepository.findById(request.getBaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Base not found with id: " + request.getBaseId()));
        } else if (request.getBaseId() != null) {
            base = baseRepository.findById(request.getBaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Base not found with id: " + request.getBaseId()));
        }

        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setRole(request.getRole());
        user.setBase(base);
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(user);
        auditLogService.log("USER_UPDATED", "USER", updated.getId(), "Updated user details for: " + updated.getName());
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Long id, Boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(active);
        User updated = userRepository.save(user);
        auditLogService.log("USER_STATUS_CHANGED", "USER", updated.getId(), "Toggled active status of " + updated.getEmail() + " to " + active);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void resetPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new BusinessRuleException("Password must be at least 6 characters long");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        auditLogService.log("PASSWORD_RESET", "USER", user.getId(), "Password reset for user: " + user.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(String search, Role role, Long baseId, Boolean active, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }
            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }
            if (baseId != null) {
                predicates.add(cb.equal(root.get("base").get("id"), baseId));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> page = userRepository.findAll(spec, pageable);
        List<UserResponse> dtoList = page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());

        return new PageResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getBase() != null ? user.getBase().getId() : null,
                user.getBase() != null ? user.getBase().getName() : null,
                user.getActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
