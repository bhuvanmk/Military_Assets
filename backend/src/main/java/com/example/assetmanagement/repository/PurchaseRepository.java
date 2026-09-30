package com.example.assetmanagement.repository;

import com.example.assetmanagement.entity.Purchase;
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
public interface PurchaseRepository extends JpaRepository<Purchase, Long>, JpaSpecificationExecutor<Purchase> {

    @EntityGraph(attributePaths = {"base", "equipmentType", "createdBy"})
    Optional<Purchase> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"base", "equipmentType", "createdBy"})
    Page<Purchase> findAll(Specification<Purchase> spec, Pageable pageable);

    boolean existsByReferenceNumber(String referenceNumber);
    boolean existsByReferenceNumberAndIdNot(String referenceNumber, Long id);

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Purchase p " +
           "WHERE (:baseId IS NULL OR p.base.id = :baseId) " +
           "AND (:equipmentTypeId IS NULL OR p.equipmentType.id = :equipmentTypeId) " +
           "AND (:fromDate IS NULL OR p.purchaseDate >= :fromDate) " +
           "AND (:toDate IS NULL OR p.purchaseDate <= :toDate)")
    Long sumQuantity(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Purchase p " +
           "WHERE p.base.id = :baseId " +
           "AND p.equipmentType.id = :equipmentTypeId " +
           "AND p.purchaseDate < :beforeDate")
    Long sumQuantityBeforeDate(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("beforeDate") LocalDate beforeDate
    );
}
