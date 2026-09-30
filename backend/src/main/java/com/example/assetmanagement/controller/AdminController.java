package com.example.assetmanagement.controller;

import com.example.assetmanagement.dto.request.BaseRequest;
import com.example.assetmanagement.dto.request.EquipmentTypeRequest;
import com.example.assetmanagement.dto.request.UserRequest;
import com.example.assetmanagement.dto.response.*;
import com.example.assetmanagement.enums.Role;
import com.example.assetmanagement.service.AuditLogService;
import com.example.assetmanagement.service.BaseService;
import com.example.assetmanagement.service.EquipmentTypeService;
import com.example.assetmanagement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final BaseService baseService;
    private final EquipmentTypeService equipmentTypeService;
    private final AuditLogService auditLogService;

    public AdminController(
            UserService userService,
            BaseService baseService,
            EquipmentTypeService equipmentTypeService,
            AuditLogService auditLogService
    ) {
        this.userService = userService;
        this.baseService = baseService;
        this.equipmentTypeService = equipmentTypeService;
        this.auditLogService = auditLogService;
    }

    // ==========================================
    // 1. ADMIN USER MANAGEMENT
    // ==========================================
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String[] sort
    ) {
        Sort.Direction direction = sort.length > 1 && sort[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        PageResponse<UserResponse> response = userService.getUsers(search, role, baseId, active, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", response));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved", response));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User created successfully", response));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", response));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> statusMap) {
        Boolean active = statusMap.getOrDefault("active", true);
        UserResponse response = userService.toggleUserStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("User status updated", response));
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> passwordMap) {
        String newPassword = passwordMap.get("password");
        userService.resetPassword(id, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }

    // ==========================================
    // 2. ADMIN BASES MANAGEMENT
    // ==========================================
    @GetMapping("/bases")
    public ResponseEntity<ApiResponse<PageResponse<BaseResponse>>> getBases(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String[] sort
    ) {
        Sort.Direction direction = sort.length > 1 && sort[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        PageResponse<BaseResponse> response = baseService.getBases(search, active, pageable);
        return ResponseEntity.ok(ApiResponse.success("Bases retrieved", response));
    }

    @PostMapping("/bases")
    public ResponseEntity<ApiResponse<BaseResponse>> createBase(@Valid @RequestBody BaseRequest request) {
        BaseResponse response = baseService.createBase(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Base created successfully", response));
    }

    @PutMapping("/bases/{id}")
    public ResponseEntity<ApiResponse<BaseResponse>> updateBase(@PathVariable Long id, @Valid @RequestBody BaseRequest request) {
        BaseResponse response = baseService.updateBase(id, request);
        return ResponseEntity.ok(ApiResponse.success("Base updated successfully", response));
    }

    // ==========================================
    // 3. ADMIN EQUIPMENT TYPES MANAGEMENT
    // ==========================================
    @GetMapping("/equipment-types")
    public ResponseEntity<ApiResponse<PageResponse<EquipmentTypeResponse>>> getEquipmentTypes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String[] sort
    ) {
        Sort.Direction direction = sort.length > 1 && sort[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        PageResponse<EquipmentTypeResponse> response = equipmentTypeService.getEquipmentTypes(search, category, active, pageable);
        return ResponseEntity.ok(ApiResponse.success("Equipment types retrieved", response));
    }

    @PostMapping("/equipment-types")
    public ResponseEntity<ApiResponse<EquipmentTypeResponse>> createEquipmentType(@Valid @RequestBody EquipmentTypeRequest request) {
        EquipmentTypeResponse response = equipmentTypeService.createEquipmentType(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Equipment type created successfully", response));
    }

    @PutMapping("/equipment-types/{id}")
    public ResponseEntity<ApiResponse<EquipmentTypeResponse>> updateEquipmentType(@PathVariable Long id, @Valid @RequestBody EquipmentTypeRequest request) {
        EquipmentTypeResponse response = equipmentTypeService.updateEquipmentType(id, request);
        return ResponseEntity.ok(ApiResponse.success("Equipment type updated successfully", response));
    }

    // ==========================================
    // 4. ADMIN AUDIT LOGS (READ-ONLY)
    // ==========================================
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort
    ) {
        Sort.Direction direction = sort.length > 1 && sort[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        PageResponse<AuditLogResponse> response = auditLogService.getAuditLogs(action, entityType, userId, fromDate, toDate, pageable);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", response));
    }
}
