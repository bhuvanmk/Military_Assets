package com.example.assetmanagement.controller;

import com.example.assetmanagement.dto.request.TransferRequest;
import com.example.assetmanagement.dto.request.TransferStatusUpdateRequest;
import com.example.assetmanagement.dto.response.ApiResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.dto.response.TransferResponse;
import com.example.assetmanagement.enums.TransferStatus;
import com.example.assetmanagement.service.TransferService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TransferResponse>>> getTransfers(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) TransferStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transferDate,desc") String[] sort
    ) {
        Sort.Direction direction = sort.length > 1 && sort[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        PageResponse<TransferResponse> response = transferService.getTransfers(baseId, equipmentTypeId, status, search, fromDate, toDate, pageable);
        return ResponseEntity.ok(ApiResponse.success("Transfers retrieved", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransferResponse>> getTransferById(@PathVariable Long id) {
        TransferResponse response = transferService.getTransferById(id);
        return ResponseEntity.ok(ApiResponse.success("Transfer retrieved", response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER')")
    public ResponseEntity<ApiResponse<TransferResponse>> createTransfer(@Valid @RequestBody TransferRequest request) {
        TransferResponse response = transferService.createTransfer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Transfer created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER')")
    public ResponseEntity<ApiResponse<TransferResponse>> updateTransferStatus(
            @PathVariable Long id,
            @Valid @RequestBody TransferStatusUpdateRequest request
    ) {
        TransferResponse response = transferService.updateTransferStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Transfer status updated successfully", response));
    }
}
