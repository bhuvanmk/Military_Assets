package com.example.assetmanagement.controller;

import com.example.assetmanagement.dto.response.ApiResponse;
import com.example.assetmanagement.dto.response.InventoryItemResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.service.InventoryService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<InventoryItemResponse>>> getInventory(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "baseId,asc") String[] sort
    ) {
        Sort.Direction direction = sort.length > 1 && sort[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        PageResponse<InventoryItemResponse> response = inventoryService.getInventory(baseId, equipmentTypeId, search, fromDate, toDate, pageable);
        return ResponseEntity.ok(ApiResponse.success("Inventory ledger retrieved", response));
    }

    @GetMapping("/item")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> getInventoryItem(
            @RequestParam Long baseId,
            @RequestParam Long equipmentTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        InventoryItemResponse response = inventoryService.calculateInventoryForItem(baseId, equipmentTypeId, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Inventory balance calculated", response));
    }
}
