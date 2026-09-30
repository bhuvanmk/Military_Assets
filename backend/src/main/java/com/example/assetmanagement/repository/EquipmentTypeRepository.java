package com.example.assetmanagement.repository;

import com.example.assetmanagement.entity.EquipmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentTypeRepository extends JpaRepository<EquipmentType, Long>, JpaSpecificationExecutor<EquipmentType> {
    Optional<EquipmentType> findByName(String name);
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);
    List<EquipmentType> findAllByActiveTrue();
}
