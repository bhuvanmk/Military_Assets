package com.example.assetmanagement.service.impl;

import com.example.assetmanagement.dto.request.PurchaseRequest;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.dto.response.PurchaseResponse;
import com.example.assetmanagement.entity.Base;
import com.example.assetmanagement.entity.EquipmentType;
import com.example.assetmanagement.entity.Purchase;
import com.example.assetmanagement.entity.User;
import com.example.assetmanagement.exception.BusinessRuleException;
import com.example.assetmanagement.exception.DuplicateResourceException;
import com.example.assetmanagement.exception.ResourceNotFoundException;
import com.example.assetmanagement.repository.BaseRepository;
import com.example.assetmanagement.repository.EquipmentTypeRepository;
import com.example.assetmanagement.repository.PurchaseRepository;
import com.example.assetmanagement.repository.UserRepository;
import com.example.assetmanagement.security.AuthorizationService;
import com.example.assetmanagement.security.UserPrincipal;
import com.example.assetmanagement.service.AuditLogService;
import com.example.assetmanagement.service.PurchaseService;
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
public class PurchaseServiceImpl implements PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final AuthorizationService authorizationService;

    public PurchaseServiceImpl(
            PurchaseRepository purchaseRepository,
            BaseRepository baseRepository,
            EquipmentTypeRepository equipmentTypeRepository,
            UserRepository userRepository,
            AuditLogService auditLogService,
            AuthorizationService authorizationService
    ) {
        this.purchaseRepository = purchaseRepository;
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.authorizationService = authorizationService;
    }

    @Override
    @Transactional
    public PurchaseResponse createPurchase(PurchaseRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BusinessRuleException("Purchase quantity must be greater than 0");
        }

        // Validate base access (Commander / Logistics officer can only purchase for their assigned base)
        authorizationService.validateBaseAccess(request.getBaseId());

        if (purchaseRepository.existsByReferenceNumber(request.getReferenceNumber().trim())) {
            throw new DuplicateResourceException("Purchase reference number already exists: " + request.getReferenceNumber());
        }

        Base base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base not found with id: " + request.getBaseId()));

        EquipmentType equipmentType = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found with id: " + request.getEquipmentTypeId()));

        UserPrincipal currentUser = authorizationService.getCurrentUser();
        User creator = currentUser != null && currentUser.getId() != null ?
                userRepository.findById(currentUser.getId()).orElse(null) : null;

        Purchase purchase = new Purchase(
                null,
                base,
                equipmentType,
                request.getQuantity(),
                request.getPurchaseDate(),
                request.getReferenceNumber().trim(),
                request.getSupplier().trim(),
                request.getRemarks(),
                creator
        );

        Purchase saved = purchaseRepository.save(purchase);

        auditLogService.log("PURCHASE_CREATED", "PURCHASE", saved.getId(),
                "Purchase " + saved.getReferenceNumber() + ": " + saved.getQuantity() + " " + equipmentType.getName() + " for " + base.getName());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        authorizationService.validateBaseAccess(purchase.getBase().getId());
        return mapToResponse(purchase);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseResponse> getPurchases(Long requestedBaseId, Long equipmentTypeId, String search, LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        Long effectiveBaseId = authorizationService.resolveEffectiveBaseId(requestedBaseId);

        Specification<Purchase> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (effectiveBaseId != null) {
                predicates.add(cb.equal(root.get("base").get("id"), effectiveBaseId));
            }
            if (equipmentTypeId != null) {
                predicates.add(cb.equal(root.get("equipmentType").get("id"), equipmentTypeId));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("purchaseDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("purchaseDate"), toDate));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("referenceNumber")), pattern),
                        cb.like(cb.lower(root.get("supplier")), pattern),
                        cb.like(cb.lower(root.get("remarks")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Purchase> page = purchaseRepository.findAll(spec, pageable);
        List<PurchaseResponse> dtoList = page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());

        return new PageResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    private PurchaseResponse mapToResponse(Purchase p) {
        PurchaseResponse res = new PurchaseResponse();
        res.setId(p.getId());
        res.setBaseId(p.getBase().getId());
        res.setBaseName(p.getBase().getName());
        res.setEquipmentTypeId(p.getEquipmentType().getId());
        res.setEquipmentTypeName(p.getEquipmentType().getName());
        res.setEquipmentCategory(p.getEquipmentType().getCategory());
        res.setUnit(p.getEquipmentType().getUnit());
        res.setQuantity(p.getQuantity());
        res.setPurchaseDate(p.getPurchaseDate());
        res.setReferenceNumber(p.getReferenceNumber());
        res.setSupplier(p.getSupplier());
        res.setRemarks(p.getRemarks());
        if (p.getCreatedBy() != null) {
            res.setCreatedById(p.getCreatedBy().getId());
            res.setCreatedByName(p.getCreatedBy().getName());
        }
        res.setCreatedAt(p.getCreatedAt());
        return res;
    }
}
