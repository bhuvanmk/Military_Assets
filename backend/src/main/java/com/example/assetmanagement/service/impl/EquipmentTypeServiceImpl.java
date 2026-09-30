package com.example.assetmanagement.service.impl;

import com.example.assetmanagement.dto.request.EquipmentTypeRequest;
import com.example.assetmanagement.dto.response.EquipmentTypeResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.entity.EquipmentType;
import com.example.assetmanagement.exception.DuplicateResourceException;
import com.example.assetmanagement.exception.ResourceNotFoundException;
import com.example.assetmanagement.repository.EquipmentTypeRepository;
import com.example.assetmanagement.service.AuditLogService;
import com.example.assetmanagement.service.EquipmentTypeService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipmentTypeServiceImpl implements EquipmentTypeService {

    private final EquipmentTypeRepository equipmentTypeRepository;
    private final AuditLogService auditLogService;

    public EquipmentTypeServiceImpl(EquipmentTypeRepository equipmentTypeRepository, AuditLogService auditLogService) {
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public EquipmentTypeResponse createEquipmentType(EquipmentTypeRequest request) {
        if (equipmentTypeRepository.existsByName(request.getName().trim())) {
            throw new DuplicateResourceException("Equipment type already exists with name: " + request.getName());
        }

        EquipmentType equipmentType = new EquipmentType(
                null,
                request.getName().trim(),
                request.getCategory().trim(),
                request.getUnit() != null ? request.getUnit().trim() : "Units",
                request.getDescription(),
                request.getActive() != null ? request.getActive() : true
        );

        EquipmentType saved = equipmentTypeRepository.save(equipmentType);
        auditLogService.log("EQUIPMENT_CREATED", "EQUIPMENT_TYPE", saved.getId(), "Created equipment type: " + saved.getName());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EquipmentTypeResponse updateEquipmentType(Long id, EquipmentTypeRequest request) {
        EquipmentType equipmentType = equipmentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found with id: " + id));

        if (equipmentTypeRepository.existsByNameAndIdNot(request.getName().trim(), id)) {
            throw new DuplicateResourceException("Another equipment type already exists with name: " + request.getName());
        }

        equipmentType.setName(request.getName().trim());
        equipmentType.setCategory(request.getCategory().trim());
        equipmentType.setUnit(request.getUnit() != null ? request.getUnit().trim() : "Units");
        equipmentType.setDescription(request.getDescription());
        if (request.getActive() != null) {
            equipmentType.setActive(request.getActive());
        }

        EquipmentType updated = equipmentTypeRepository.save(equipmentType);
        auditLogService.log("EQUIPMENT_UPDATED", "EQUIPMENT_TYPE", updated.getId(), "Updated equipment type: " + updated.getName());
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentTypeResponse getEquipmentTypeById(Long id) {
        EquipmentType equipmentType = equipmentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found with id: " + id));
        return mapToResponse(equipmentType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentTypeResponse> getAllActiveEquipmentTypes() {
        return equipmentTypeRepository.findAllByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EquipmentTypeResponse> getEquipmentTypes(String search, String category, Boolean active, Pageable pageable) {
        Specification<EquipmentType> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("category")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }
            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(root.get("category"), category.trim()));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<EquipmentType> page = equipmentTypeRepository.findAll(spec, pageable);
        List<EquipmentTypeResponse> dtoList = page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());

        return new PageResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    private EquipmentTypeResponse mapToResponse(EquipmentType eq) {
        return new EquipmentTypeResponse(
                eq.getId(),
                eq.getName(),
                eq.getCategory(),
                eq.getUnit(),
                eq.getDescription(),
                eq.getActive(),
                eq.getCreatedAt(),
                eq.getUpdatedAt()
        );
    }
}
