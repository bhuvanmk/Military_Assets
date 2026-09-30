package com.example.assetmanagement.service.impl;

import com.example.assetmanagement.dto.request.LoginRequest;
import com.example.assetmanagement.dto.response.AuthResponse;
import com.example.assetmanagement.dto.response.UserResponse;
import com.example.assetmanagement.entity.User;
import com.example.assetmanagement.enums.Role;
import com.example.assetmanagement.exception.AccessDeniedBusinessException;
import com.example.assetmanagement.exception.InvalidCredentialsException;
import com.example.assetmanagement.exception.ResourceNotFoundException;
import com.example.assetmanagement.repository.UserRepository;
import com.example.assetmanagement.security.AuthorizationService;
import com.example.assetmanagement.security.JwtService;
import com.example.assetmanagement.security.UserPrincipal;
import com.example.assetmanagement.service.AuditLogService;
import com.example.assetmanagement.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final AuthorizationService authorizationService;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            AuditLogService auditLogService,
            AuthorizationService authorizationService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.authorizationService = authorizationService;
    }

    @Override
    public AuthResponse loginUser(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        User user = userRepository.findByEmail(email).orElse(null);

        // Check credentials
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (DisabledException ex) {
            auditLogService.log("LOGIN_FAILED", "USER", user != null ? user.getId() : null,
                    "Login rejected: Account is deactivated (" + email + ")");
            throw new AccessDeniedBusinessException("Account is deactivated.");
        } catch (AuthenticationException ex) {
            auditLogService.log("LOGIN_FAILED", "USER", user != null ? user.getId() : null,
                    "Failed user login attempt for: " + email);
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        // Check if user is active in DB
        if (!principal.isEnabled()) {
            auditLogService.log("LOGIN_FAILED", "USER", principal.getId(), "Login rejected: Account is deactivated");
            throw new AccessDeniedBusinessException("Account is deactivated.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtService.generateToken(authentication);

        auditLogService.log("USER_LOGIN", "USER", principal.getId(),
                "User logged in: " + principal.getName() + " (" + principal.getRole() + ")");

        return new AuthResponse(
                jwt,
                principal.getId(),
                principal.getName(),
                principal.getEmail(),
                principal.getRole(),
                principal.getBaseId(),
                principal.getBaseName()
        );
    }

    @Override
    public AuthResponse loginAdmin(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        User user = userRepository.findByEmail(email).orElse(null);

        // Authenticate credentials
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (DisabledException ex) {
            auditLogService.log("LOGIN_FAILED", "USER", user != null ? user.getId() : null,
                    "Admin login rejected: Account is deactivated (" + email + ")");
            throw new AccessDeniedBusinessException("Account is deactivated.");
        } catch (AuthenticationException ex) {
            auditLogService.log("LOGIN_FAILED", "USER", user != null ? user.getId() : null,
                    "Failed admin login attempt for: " + email);
            throw new InvalidCredentialsException("Invalid admin credentials.");
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        // Check if user is active in DB
        if (!principal.isEnabled()) {
            auditLogService.log("LOGIN_FAILED", "USER", principal.getId(), "Admin login rejected: Account is deactivated");
            throw new AccessDeniedBusinessException("Account is deactivated.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtService.generateToken(authentication);

        auditLogService.log("ADMIN_LOGIN", "USER", principal.getId(),
                "Administrator logged in: " + principal.getName() + " (" + principal.getRole() + ")");

        return new AuthResponse(
                jwt,
                principal.getId(),
                principal.getName(),
                principal.getEmail(),
                principal.getRole(),
                principal.getBaseId(),
                principal.getBaseName()
        );
    }

    @Override
    public UserResponse getCurrentUser() {
        UserPrincipal principal = authorizationService.getCurrentUser();
        if (principal == null) {
            throw new ResourceNotFoundException("No active user session found");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));

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

    @Override
    public void logout() {
        UserPrincipal principal = authorizationService.getCurrentUser();
        if (principal != null) {
            auditLogService.log("USER_LOGOUT", "USER", principal.getId(), "User logged out: " + principal.getEmail());
        }
        SecurityContextHolder.clearContext();
    }
}
