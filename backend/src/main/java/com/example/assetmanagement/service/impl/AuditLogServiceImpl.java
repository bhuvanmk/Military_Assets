package com.example.assetmanagement.service.impl;

import com.example.assetmanagement.dto.response.AuditLogResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.entity.AuditLog;
import com.example.assetmanagement.entity.User;
import com.example.assetmanagement.repository.AuditLogRepository;
import com.example.assetmanagement.repository.UserRepository;
import com.example.assetmanagement.security.AuthorizationService;
import com.example.assetmanagement.security.UserPrincipal;
import com.example.assetmanagement.service.AuditLogService;
import jakarta.persistence.criteria.Predicate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository, UserRepository userRepository, AuthorizationService authorizationService) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.authorizationService = authorizationService;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void log(String action, String entityType, Long entityId, String description) {
        UserPrincipal currentUser = authorizationService.getCurrentUser();
        User user = null;
        if (currentUser != null && currentUser.getId() != null) {
            user = userRepository.findById(currentUser.getId()).orElse(null);
        }

        String ipAddress = "127.0.0.1";
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                    ipAddress = xForwardedFor.split(",")[0].trim();
                } else {
                    ipAddress = request.getRemoteAddr();
                }
            }
        } catch (Exception ignored) {}

        AuditLog log = new AuditLog(null, user, action, entityType, entityId, description, ipAddress);
        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogs(String action, String entityType, Long userId, LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable) {
        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (action != null && !action.isBlank()) {
                predicates.add(cb.equal(root.get("action"), action.trim()));
            }
            if (entityType != null && !entityType.isBlank()) {
                predicates.add(cb.equal(root.get("entityType"), entityType.trim()));
            }
            if (userId != null) {
                predicates.add(cb.equal(root.get("user").get("id"), userId));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AuditLog> page = auditLogRepository.findAll(spec, pageable);
        List<AuditLogResponse> dtoList = page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());

        return new PageResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        AuditLogResponse res = new AuditLogResponse();
        res.setId(log.getId());
        if (log.getUser() != null) {
            res.setUserId(log.getUser().getId());
            res.setUserName(log.getUser().getName());
            res.setUserEmail(log.getUser().getEmail());
        }
        res.setAction(log.getAction());
        res.setEntityType(log.getEntityType());
        res.setEntityId(log.getEntityId());
        res.setDescription(log.getDescription());
        res.setIpAddress(log.getIpAddress());
        res.setCreatedAt(log.getCreatedAt());
        return res;
    }
}
