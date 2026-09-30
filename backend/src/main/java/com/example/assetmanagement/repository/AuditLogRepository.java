package com.example.assetmanagement.repository;

import com.example.assetmanagement.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    @EntityGraph(attributePaths = {"user"})
    Optional<AuditLog> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"user"})
    Page<AuditLog> findAll(Specification<AuditLog> spec, Pageable pageable);
}
