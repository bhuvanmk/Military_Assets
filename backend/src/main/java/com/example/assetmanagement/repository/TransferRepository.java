package com.example.assetmanagement.repository;

import com.example.assetmanagement.entity.Transfer;
import com.example.assetmanagement.enums.TransferStatus;
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
public interface TransferRepository extends JpaRepository<Transfer, Long>, JpaSpecificationExecutor<Transfer> {

    @EntityGraph(attributePaths = {"fromBase", "toBase", "equipmentType", "createdBy"})
    Optional<Transfer> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"fromBase", "toBase", "equipmentType", "createdBy"})
    Page<Transfer> findAll(Specification<Transfer> spec, Pageable pageable);

    boolean existsByReferenceNumber(String referenceNumber);
    boolean existsByReferenceNumberAndIdNot(String referenceNumber, Long id);

    // Transfer IN: toBaseId = baseId and status = COMPLETED
    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM Transfer t " +
           "WHERE t.status = :status " +
           "AND (:baseId IS NULL OR t.toBase.id = :baseId) " +
           "AND (:equipmentTypeId IS NULL OR t.equipmentType.id = :equipmentTypeId) " +
           "AND (:fromDate IS NULL OR t.transferDate >= :fromDate) " +
           "AND (:toDate IS NULL OR t.transferDate <= :toDate)")
    Long sumTransferIn(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") TransferStatus status
    );

    // Transfer OUT: fromBaseId = baseId and status = COMPLETED
    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM Transfer t " +
           "WHERE t.status = :status " +
           "AND (:baseId IS NULL OR t.fromBase.id = :baseId) " +
           "AND (:equipmentTypeId IS NULL OR t.equipmentType.id = :equipmentTypeId) " +
           "AND (:fromDate IS NULL OR t.transferDate >= :fromDate) " +
           "AND (:toDate IS NULL OR t.transferDate <= :toDate)")
    Long sumTransferOut(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("status") TransferStatus status
    );

    // Historical before date for Transfer IN
    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM Transfer t " +
           "WHERE t.status = :status " +
           "AND t.toBase.id = :baseId " +
           "AND t.equipmentType.id = :equipmentTypeId " +
           "AND t.transferDate < :beforeDate")
    Long sumTransferInBeforeDate(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("beforeDate") LocalDate beforeDate,
            @Param("status") TransferStatus status
    );

    // Historical before date for Transfer OUT
    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM Transfer t " +
           "WHERE t.status = :status " +
           "AND t.fromBase.id = :baseId " +
           "AND t.equipmentType.id = :equipmentTypeId " +
           "AND t.transferDate < :beforeDate")
    Long sumTransferOutBeforeDate(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("beforeDate") LocalDate beforeDate,
            @Param("status") TransferStatus status
    );
}
