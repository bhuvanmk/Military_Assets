package com.example.assetmanagement.service;

import com.example.assetmanagement.dto.request.EquipmentTypeRequest;
import com.example.assetmanagement.dto.response.EquipmentTypeResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EquipmentTypeService {
    EquipmentTypeResponse createEquipmentType(EquipmentTypeRequest request);
    EquipmentTypeResponse updateEquipmentType(Long id, EquipmentTypeRequest request);
    EquipmentTypeResponse getEquipmentTypeById(Long id);
    List<EquipmentTypeResponse> getAllActiveEquipmentTypes();
    PageResponse<EquipmentTypeResponse> getEquipmentTypes(String search, String category, Boolean active, Pageable pageable);
}
