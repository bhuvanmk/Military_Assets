package com.example.assetmanagement.repository;

import com.example.assetmanagement.entity.Assignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long>, JpaSpecificationExecutor<Assignment> {

    @EntityGraph(attributePaths = {"base", "equipmentType", "createdBy"})
    Optional<Assignment> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"base", "equipmentType", "createdBy"})
    Page<Assignment> findAll(Specification<Assignment> spec, Pageable pageable);

    @Query("SELECT COALESCE(SUM(a.quantity), 0) FROM Assignment a " +
           "WHERE (:baseId IS NULL OR a.base.id = :baseId) " +
           "AND (:equipmentTypeId IS NULL OR a.equipmentType.id = :equipmentTypeId) " +
           "AND (:fromDate IS NULL OR a.assignmentDate >= :fromDate) " +
           "AND (:toDate IS NULL OR a.assignmentDate <= :toDate)")
    Long sumQuantity(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("SELECT COALESCE(SUM(a.quantity), 0) FROM Assignment a " +
           "WHERE a.base.id = :baseId " +
           "AND a.equipmentType.id = :equipmentTypeId " +
           "AND a.assignmentDate < :beforeDate")
    Long sumQuantityBeforeDate(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("beforeDate") LocalDate beforeDate
    );
}
