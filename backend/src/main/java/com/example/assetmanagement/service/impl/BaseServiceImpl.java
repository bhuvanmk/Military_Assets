package com.example.assetmanagement.service.impl;

import com.example.assetmanagement.dto.request.BaseRequest;
import com.example.assetmanagement.dto.response.BaseResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.entity.Base;
import com.example.assetmanagement.exception.DuplicateResourceException;
import com.example.assetmanagement.exception.ResourceNotFoundException;
import com.example.assetmanagement.repository.BaseRepository;
import com.example.assetmanagement.service.AuditLogService;
import com.example.assetmanagement.service.BaseService;
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
public class BaseServiceImpl implements BaseService {

    private final BaseRepository baseRepository;
    private final AuditLogService auditLogService;

    public BaseServiceImpl(BaseRepository baseRepository, AuditLogService auditLogService) {
        this.baseRepository = baseRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public BaseResponse createBase(BaseRequest request) {
        if (baseRepository.existsByName(request.getName().trim())) {
            throw new DuplicateResourceException("Base already exists with name: " + request.getName());
        }

        Base base = new Base(
                null,
                request.getName().trim(),
                request.getLocation().trim(),
                request.getDescription(),
                request.getActive() != null ? request.getActive() : true
        );

        Base saved = baseRepository.save(base);
        auditLogService.log("BASE_CREATED", "BASE", saved.getId(), "Created base: " + saved.getName());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BaseResponse updateBase(Long id, BaseRequest request) {
        Base base = baseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Base not found with id: " + id));

        if (baseRepository.existsByNameAndIdNot(request.getName().trim(), id)) {
            throw new DuplicateResourceException("Another base already exists with name: " + request.getName());
        }

        base.setName(request.getName().trim());
        base.setLocation(request.getLocation().trim());
        base.setDescription(request.getDescription());
        if (request.getActive() != null) {
            base.setActive(request.getActive());
        }

        Base updated = baseRepository.save(base);
        auditLogService.log("BASE_UPDATED", "BASE", updated.getId(), "Updated base: " + updated.getName());
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public BaseResponse getBaseById(Long id) {
        Base base = baseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Base not found with id: " + id));
        return mapToResponse(base);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BaseResponse> getAllActiveBases() {
        return baseRepository.findAllByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BaseResponse> getBases(String search, Boolean active, Pageable pageable) {
        Specification<Base> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("location")), pattern)
                ));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Base> page = baseRepository.findAll(spec, pageable);
        List<BaseResponse> dtoList = page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());

        return new PageResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    private BaseResponse mapToResponse(Base base) {
        return new BaseResponse(
                base.getId(),
                base.getName(),
                base.getLocation(),
                base.getDescription(),
                base.getActive(),
                base.getCreatedAt(),
                base.getUpdatedAt()
        );
    }
}
