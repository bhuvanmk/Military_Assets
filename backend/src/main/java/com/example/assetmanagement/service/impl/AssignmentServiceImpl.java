package com.example.assetmanagement.service.impl;

import com.example.assetmanagement.dto.request.AssignmentRequest;
import com.example.assetmanagement.dto.response.AssignmentResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.entity.Assignment;
import com.example.assetmanagement.entity.Base;
import com.example.assetmanagement.entity.EquipmentType;
import com.example.assetmanagement.entity.User;
import com.example.assetmanagement.exception.BusinessRuleException;
import com.example.assetmanagement.exception.ResourceNotFoundException;
import com.example.assetmanagement.repository.AssignmentRepository;
import com.example.assetmanagement.repository.BaseRepository;
import com.example.assetmanagement.repository.EquipmentTypeRepository;
import com.example.assetmanagement.repository.UserRepository;
import com.example.assetmanagement.security.AuthorizationService;
import com.example.assetmanagement.security.UserPrincipal;
import com.example.assetmanagement.service.AssignmentService;
import com.example.assetmanagement.service.AuditLogService;
import com.example.assetmanagement.service.InventoryService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final AuditLogService auditLogService;
    private final AuthorizationService authorizationService;

    public AssignmentServiceImpl(
            AssignmentRepository assignmentRepository,
            BaseRepository baseRepository,
            EquipmentTypeRepository equipmentTypeRepository,
            UserRepository userRepository,
            InventoryService inventoryService,
            AuditLogService auditLogService,
            AuthorizationService authorizationService
    ) {
        this.assignmentRepository = assignmentRepository;
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.userRepository = userRepository;
        this.inventoryService = inventoryService;
        this.auditLogService = auditLogService;
        this.authorizationService = authorizationService;
    }

    @Override
    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BusinessRuleException("Assignment quantity must be greater than 0");
        }

        authorizationService.validateBaseAccess(request.getBaseId());

        Base base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base not found with id: " + request.getBaseId()));

        EquipmentType equipmentType = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found with id: " + request.getEquipmentTypeId()));

        int available = inventoryService.getAvailableBalance(base.getId(), equipmentType.getId());
        if (available < request.getQuantity()) {
            throw new BusinessRuleException("Insufficient inventory available to assign. Available: " + available +
                    ", Requested: " + request.getQuantity());
        }

        UserPrincipal currentUser = authorizationService.getCurrentUser();
        User creator = currentUser != null && currentUser.getId() != null ?
                userRepository.findById(currentUser.getId()).orElse(null) : null;

        Assignment assignment = new Assignment(
                null,
                base,
                equipmentType,
                request.getPersonnelName().trim(),
                request.getQuantity(),
                request.getAssignmentDate(),
                request.getRemarks(),
                creator
        );

        Assignment saved = assignmentRepository.save(assignment);

        auditLogService.log("ASSIGNMENT_CREATED", "ASSIGNMENT", saved.getId(),
                "Assigned " + saved.getQuantity() + " " + equipmentType.getName() + " to " + saved.getPersonnelName() + " at " + base.getName());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentResponse getAssignmentById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));

        authorizationService.validateBaseAccess(assignment.getBase().getId());
        return mapToResponse(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AssignmentResponse> getAssignments(Long requestedBaseId, Long equipmentTypeId, String search, LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        Long effectiveBaseId = authorizationService.resolveEffectiveBaseId(requestedBaseId);

        Specification<Assignment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (effectiveBaseId != null) {
                predicates.add(cb.equal(root.get("base").get("id"), effectiveBaseId));
            }
            if (equipmentTypeId != null) {
                predicates.add(cb.equal(root.get("equipmentType").get("id"), equipmentTypeId));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("assignmentDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("assignmentDate"), toDate));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("personnelName")), pattern),
                        cb.like(cb.lower(root.get("remarks")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Assignment> page = assignmentRepository.findAll(spec, pageable);
        List<AssignmentResponse> dtoList = page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());

        return new PageResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    private AssignmentResponse mapToResponse(Assignment a) {
        AssignmentResponse res = new AssignmentResponse();
        res.setId(a.getId());
        res.setBaseId(a.getBase().getId());
        res.setBaseName(a.getBase().getName());
        res.setEquipmentTypeId(a.getEquipmentType().getId());
        res.setEquipmentTypeName(a.getEquipmentType().getName());
        res.setEquipmentCategory(a.getEquipmentType().getCategory());
        res.setUnit(a.getEquipmentType().getUnit());
        res.setPersonnelName(a.getPersonnelName());
        res.setQuantity(a.getQuantity());
        res.setAssignmentDate(a.getAssignmentDate());
    UserPrincipal currentUser = authorizationService.getCurrentUser();
        boolean isLogistics = currentUser != null && currentUser.getRole() == com.example.assetmanagement.enums.Role.LOGISTICS_OFFICER;

        if (isLogistics) {
            res.setRemarks(null);
            res.setCreatedById(null);
            res.setCreatedByName(null);
        } else {
            res.setRemarks(a.getRemarks());
            if (a.getCreatedBy() != null) {
                res.setCreatedById(a.getCreatedBy().getId());
                res.setCreatedByName(a.getCreatedBy().getName());
            }
        }
        res.setCreatedAt(a.getCreatedAt());
        return res;
    }
}
