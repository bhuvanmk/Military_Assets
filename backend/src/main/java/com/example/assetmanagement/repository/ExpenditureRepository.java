package com.example.assetmanagement.repository;

import com.example.assetmanagement.entity.Expenditure;
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
public interface ExpenditureRepository extends JpaRepository<Expenditure, Long>, JpaSpecificationExecutor<Expenditure> {

    @EntityGraph(attributePaths = {"base", "equipmentType", "createdBy"})
    Optional<Expenditure> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"base", "equipmentType", "createdBy"})
    Page<Expenditure> findAll(Specification<Expenditure> spec, Pageable pageable);

    @Query("SELECT COALESCE(SUM(e.quantity), 0) FROM Expenditure e " +
           "WHERE (:baseId IS NULL OR e.base.id = :baseId) " +
           "AND (:equipmentTypeId IS NULL OR e.equipmentType.id = :equipmentTypeId) " +
           "AND (:fromDate IS NULL OR e.expenditureDate >= :fromDate) " +
           "AND (:toDate IS NULL OR e.expenditureDate <= :toDate)")
    Long sumQuantity(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("SELECT COALESCE(SUM(e.quantity), 0) FROM Expenditure e " +
           "WHERE e.base.id = :baseId " +
           "AND e.equipmentType.id = :equipmentTypeId " +
           "AND e.expenditureDate < :beforeDate")
    Long sumQuantityBeforeDate(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("beforeDate") LocalDate beforeDate
    );
}
