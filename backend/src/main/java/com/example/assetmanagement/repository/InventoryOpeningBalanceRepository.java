package com.example.assetmanagement.repository;

import com.example.assetmanagement.entity.InventoryOpeningBalance;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryOpeningBalanceRepository extends JpaRepository<InventoryOpeningBalance, Long>, JpaSpecificationExecutor<InventoryOpeningBalance> {
    
    @EntityGraph(attributePaths = {"base", "equipmentType"})
    Optional<InventoryOpeningBalance> findByBaseIdAndEquipmentTypeId(Long baseId, Long equipmentTypeId);

    @EntityGraph(attributePaths = {"base", "equipmentType"})
    List<InventoryOpeningBalance> findAllByBaseId(Long baseId);

    @EntityGraph(attributePaths = {"base", "equipmentType"})
    List<InventoryOpeningBalance> findAllByEquipmentTypeId(Long equipmentTypeId);
}
