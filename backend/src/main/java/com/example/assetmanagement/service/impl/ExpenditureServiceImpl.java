package com.example.assetmanagement.service.impl;

import com.example.assetmanagement.dto.request.ExpenditureRequest;
import com.example.assetmanagement.dto.response.ExpenditureResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.entity.Base;
import com.example.assetmanagement.entity.EquipmentType;
import com.example.assetmanagement.entity.Expenditure;
import com.example.assetmanagement.entity.User;
import com.example.assetmanagement.exception.BusinessRuleException;
import com.example.assetmanagement.exception.ResourceNotFoundException;
import com.example.assetmanagement.repository.BaseRepository;
import com.example.assetmanagement.repository.EquipmentTypeRepository;
import com.example.assetmanagement.repository.ExpenditureRepository;
import com.example.assetmanagement.repository.UserRepository;
import com.example.assetmanagement.security.AuthorizationService;
import com.example.assetmanagement.security.UserPrincipal;
import com.example.assetmanagement.service.AuditLogService;
import com.example.assetmanagement.service.ExpenditureService;
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
public class ExpenditureServiceImpl implements ExpenditureService {

    private final ExpenditureRepository expenditureRepository;
    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final AuditLogService auditLogService;
    private final AuthorizationService authorizationService;

    public ExpenditureServiceImpl(
            ExpenditureRepository expenditureRepository,
            BaseRepository baseRepository,
            EquipmentTypeRepository equipmentTypeRepository,
            UserRepository userRepository,
            InventoryService inventoryService,
            AuditLogService auditLogService,
            AuthorizationService authorizationService
    ) {
        this.expenditureRepository = expenditureRepository;
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.userRepository = userRepository;
        this.inventoryService = inventoryService;
        this.auditLogService = auditLogService;
        this.authorizationService = authorizationService;
    }

    @Override
    @Transactional
    public ExpenditureResponse createExpenditure(ExpenditureRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BusinessRuleException("Expenditure quantity must be greater than 0");
        }

        authorizationService.validateBaseAccess(request.getBaseId());

        Base base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base not found with id: " + request.getBaseId()));

        EquipmentType equipmentType = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found with id: " + request.getEquipmentTypeId()));

        int available = inventoryService.getAvailableBalance(base.getId(), equipmentType.getId());
        if (available < request.getQuantity()) {
            throw new BusinessRuleException("Insufficient inventory available to expend. Available: " + available +
                    ", Requested: " + request.getQuantity());
        }

        UserPrincipal currentUser = authorizationService.getCurrentUser();
        User creator = currentUser != null && currentUser.getId() != null ?
                userRepository.findById(currentUser.getId()).orElse(null) : null;

        Expenditure expenditure = new Expenditure(
                null,
                base,
                equipmentType,
                request.getQuantity(),
                request.getExpenditureDate(),
                request.getReason().trim(),
                request.getRemarks(),
                creator
        );

        Expenditure saved = expenditureRepository.save(expenditure);

        auditLogService.log("EXPENDITURE_CREATED", "EXPENDITURE", saved.getId(),
                "Expended " + saved.getQuantity() + " " + equipmentType.getName() + " from " + base.getName() + " Reason: " + saved.getReason());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenditureResponse getExpenditureById(Long id) {
        Expenditure expenditure = expenditureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expenditure not found with id: " + id));

        authorizationService.validateBaseAccess(expenditure.getBase().getId());
        return mapToResponse(expenditure);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ExpenditureResponse> getExpenditures(Long requestedBaseId, Long equipmentTypeId, String search, LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        Long effectiveBaseId = authorizationService.resolveEffectiveBaseId(requestedBaseId);

        Specification<Expenditure> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (effectiveBaseId != null) {
                predicates.add(cb.equal(root.get("base").get("id"), effectiveBaseId));
            }
            if (equipmentTypeId != null) {
                predicates.add(cb.equal(root.get("equipmentType").get("id"), equipmentTypeId));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("expenditureDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("expenditureDate"), toDate));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("reason")), pattern),
                        cb.like(cb.lower(root.get("remarks")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Expenditure> page = expenditureRepository.findAll(spec, pageable);
        List<ExpenditureResponse> dtoList = page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());

        return new PageResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    private ExpenditureResponse mapToResponse(Expenditure e) {
        ExpenditureResponse res = new ExpenditureResponse();
        res.setId(e.getId());
        res.setBaseId(e.getBase().getId());
        res.setBaseName(e.getBase().getName());
        res.setEquipmentTypeId(e.getEquipmentType().getId());
        res.setEquipmentTypeName(e.getEquipmentType().getName());
        res.setEquipmentCategory(e.getEquipmentType().getCategory());
        res.setUnit(e.getEquipmentType().getUnit());
        res.setQuantity(e.getQuantity());
        res.setExpenditureDate(e.getExpenditureDate());
        res.setReason(e.getReason());
        res.setRemarks(e.getRemarks());
        if (e.getCreatedBy() != null) {
            res.setCreatedById(e.getCreatedBy().getId());
            res.setCreatedByName(e.getCreatedBy().getName());
        }
        res.setCreatedAt(e.getCreatedAt());
        return res;
    }
}
