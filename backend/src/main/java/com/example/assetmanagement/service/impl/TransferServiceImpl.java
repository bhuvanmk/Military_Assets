package com.example.assetmanagement.service.impl;

import com.example.assetmanagement.dto.request.TransferRequest;
import com.example.assetmanagement.dto.request.TransferStatusUpdateRequest;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.dto.response.TransferResponse;
import com.example.assetmanagement.entity.Base;
import com.example.assetmanagement.entity.EquipmentType;
import com.example.assetmanagement.entity.Transfer;
import com.example.assetmanagement.entity.User;
import com.example.assetmanagement.enums.Role;
import com.example.assetmanagement.enums.TransferStatus;
import com.example.assetmanagement.exception.BusinessRuleException;
import com.example.assetmanagement.exception.DuplicateResourceException;
import com.example.assetmanagement.exception.ResourceNotFoundException;
import com.example.assetmanagement.exception.UnauthorizedBaseAccessException;
import com.example.assetmanagement.repository.BaseRepository;
import com.example.assetmanagement.repository.EquipmentTypeRepository;
import com.example.assetmanagement.repository.TransferRepository;
import com.example.assetmanagement.repository.UserRepository;
import com.example.assetmanagement.security.AuthorizationService;
import com.example.assetmanagement.security.UserPrincipal;
import com.example.assetmanagement.service.AuditLogService;
import com.example.assetmanagement.service.InventoryService;
import com.example.assetmanagement.service.TransferService;
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
public class TransferServiceImpl implements TransferService {

    private final TransferRepository transferRepository;
    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final AuditLogService auditLogService;
    private final AuthorizationService authorizationService;

    public TransferServiceImpl(
            TransferRepository transferRepository,
            BaseRepository baseRepository,
            EquipmentTypeRepository equipmentTypeRepository,
            UserRepository userRepository,
            InventoryService inventoryService,
            AuditLogService auditLogService,
            AuthorizationService authorizationService
    ) {
        this.transferRepository = transferRepository;
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.userRepository = userRepository;
        this.inventoryService = inventoryService;
        this.auditLogService = auditLogService;
        this.authorizationService = authorizationService;
    }

    @Override
    @Transactional
    public TransferResponse createTransfer(TransferRequest request) {
        if (request.getFromBaseId().equals(request.getToBaseId())) {
            throw new BusinessRuleException("Source and Destination base cannot be the same");
        }

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BusinessRuleException("Transfer quantity must be greater than 0");
        }

        // Non-admin can only initiate transfer FROM their base
        authorizationService.validateBaseAccess(request.getFromBaseId());

        if (transferRepository.existsByReferenceNumber(request.getReferenceNumber().trim())) {
            throw new DuplicateResourceException("Transfer reference number already exists: " + request.getReferenceNumber());
        }

        Base fromBase = baseRepository.findById(request.getFromBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Source Base not found with id: " + request.getFromBaseId()));

        Base toBase = baseRepository.findById(request.getToBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination Base not found with id: " + request.getToBaseId()));

        EquipmentType equipmentType = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found with id: " + request.getEquipmentTypeId()));

        // Check source inventory available balance
        int availableSource = inventoryService.getAvailableBalance(fromBase.getId(), equipmentType.getId());
        if (availableSource < request.getQuantity()) {
            throw new BusinessRuleException("Insufficient inventory in source base (" + fromBase.getName() +
                    "). Available: " + availableSource + ", Requested: " + request.getQuantity());
        }

        UserPrincipal currentUser = authorizationService.getCurrentUser();
        User creator = currentUser != null && currentUser.getId() != null ?
                userRepository.findById(currentUser.getId()).orElse(null) : null;

        Transfer transfer = new Transfer(
                null,
                fromBase,
                toBase,
                equipmentType,
                request.getQuantity(),
                request.getTransferDate(),
                request.getStatus() != null ? request.getStatus() : TransferStatus.PENDING,
                request.getReferenceNumber().trim(),
                request.getRemarks(),
                creator
        );

        Transfer saved = transferRepository.save(transfer);

        auditLogService.log("TRANSFER_CREATED", "TRANSFER", saved.getId(),
                "Transfer " + saved.getReferenceNumber() + " (" + saved.getStatus() + "): " +
                        saved.getQuantity() + " " + equipmentType.getName() + " from " + fromBase.getName() + " to " + toBase.getName());

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public TransferResponse updateTransferStatus(Long id, TransferStatusUpdateRequest request) {
        Transfer transfer = transferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with id: " + id));

        UserPrincipal currentUser = authorizationService.getCurrentUser();
        if (currentUser != null && currentUser.getRole() != Role.ADMIN) {
            // User must belong to either fromBase or toBase to update transfer status
            Long userBaseId = currentUser.getBaseId();
            if (userBaseId == null || (!userBaseId.equals(transfer.getFromBase().getId()) && !userBaseId.equals(transfer.getToBase().getId()))) {
                throw new UnauthorizedBaseAccessException("Access denied. You are not authorized to update transfers for other bases.");
            }
        }

        // If transitioning to COMPLETED, re-verify sufficient inventory at source base
        if (request.getStatus() == TransferStatus.COMPLETED && transfer.getStatus() != TransferStatus.COMPLETED) {
            int availableSource = inventoryService.getAvailableBalance(transfer.getFromBase().getId(), transfer.getEquipmentType().getId());
            if (availableSource < transfer.getQuantity()) {
                throw new BusinessRuleException("Cannot complete transfer. Insufficient source inventory. Available: " +
                        availableSource + ", Required: " + transfer.getQuantity());
            }
        }

        TransferStatus previousStatus = transfer.getStatus();
        transfer.setStatus(request.getStatus());
        if (request.getRemarks() != null && !request.getRemarks().isBlank()) {
            transfer.setRemarks(transfer.getRemarks() != null ? transfer.getRemarks() + " | " + request.getRemarks() : request.getRemarks());
        }

        Transfer updated = transferRepository.save(transfer);

        auditLogService.log("TRANSFER_UPDATED", "TRANSFER", updated.getId(),
                "Transfer " + updated.getReferenceNumber() + " status changed from " + previousStatus + " to " + updated.getStatus());

        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public TransferResponse getTransferById(Long id) {
        Transfer transfer = transferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with id: " + id));

        UserPrincipal currentUser = authorizationService.getCurrentUser();
        if (currentUser != null && currentUser.getRole() != Role.ADMIN) {
            Long userBaseId = currentUser.getBaseId();
            if (userBaseId == null || (!userBaseId.equals(transfer.getFromBase().getId()) && !userBaseId.equals(transfer.getToBase().getId()))) {
                throw new UnauthorizedBaseAccessException("Access denied. You can only view transfers involving your base.");
            }
        }

        return mapToResponse(transfer);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransferResponse> getTransfers(Long requestedBaseId, Long equipmentTypeId, TransferStatus status, String search, LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        Long effectiveBaseId = authorizationService.resolveEffectiveBaseId(requestedBaseId);

        Specification<Transfer> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (effectiveBaseId != null) {
                // Must be either sender or receiver
                predicates.add(cb.or(
                        cb.equal(root.get("fromBase").get("id"), effectiveBaseId),
                        cb.equal(root.get("toBase").get("id"), effectiveBaseId)
                ));
            }
            if (equipmentTypeId != null) {
                predicates.add(cb.equal(root.get("equipmentType").get("id"), equipmentTypeId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("transferDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("transferDate"), toDate));
            }
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("referenceNumber")), pattern),
                        cb.like(cb.lower(root.get("remarks")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Transfer> page = transferRepository.findAll(spec, pageable);
        List<TransferResponse> dtoList = page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());

        return new PageResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    private TransferResponse mapToResponse(Transfer t) {
        TransferResponse res = new TransferResponse();
        res.setId(t.getId());
        res.setFromBaseId(t.getFromBase().getId());
        res.setFromBaseName(t.getFromBase().getName());
        res.setToBaseId(t.getToBase().getId());
        res.setToBaseName(t.getToBase().getName());
        res.setEquipmentTypeId(t.getEquipmentType().getId());
        res.setEquipmentTypeName(t.getEquipmentType().getName());
        res.setEquipmentCategory(t.getEquipmentType().getCategory());
        res.setUnit(t.getEquipmentType().getUnit());
        res.setQuantity(t.getQuantity());
        res.setTransferDate(t.getTransferDate());
        res.setStatus(t.getStatus());
        res.setReferenceNumber(t.getReferenceNumber());
        res.setRemarks(t.getRemarks());
        if (t.getCreatedBy() != null) {
            res.setCreatedById(t.getCreatedBy().getId());
            res.setCreatedByName(t.getCreatedBy().getName());
        }
        res.setCreatedAt(t.getCreatedAt());
        res.setUpdatedAt(t.getUpdatedAt());
        return res;
    }
}
