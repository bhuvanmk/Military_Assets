package com.example.assetmanagement.controller;

import com.example.assetmanagement.dto.response.ApiResponse;
import com.example.assetmanagement.dto.response.EquipmentTypeResponse;
import com.example.assetmanagement.service.EquipmentTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/equipment-types")
public class EquipmentTypeController {

    private final EquipmentTypeService equipmentTypeService;

    public EquipmentTypeController(EquipmentTypeService equipmentTypeService) {
        this.equipmentTypeService = equipmentTypeService;
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<EquipmentTypeResponse>>> getActiveEquipmentTypes() {
        List<EquipmentTypeResponse> response = equipmentTypeService.getAllActiveEquipmentTypes();
        return ResponseEntity.ok(ApiResponse.success("Active equipment types retrieved", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentTypeResponse>> getEquipmentTypeById(@PathVariable Long id) {
        EquipmentTypeResponse response = equipmentTypeService.getEquipmentTypeById(id);
        return ResponseEntity.ok(ApiResponse.success("Equipment type details retrieved", response));
    }
}
