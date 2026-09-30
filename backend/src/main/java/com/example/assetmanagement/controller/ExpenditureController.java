package com.example.assetmanagement.controller;

import com.example.assetmanagement.dto.request.ExpenditureRequest;
import com.example.assetmanagement.dto.response.ApiResponse;
import com.example.assetmanagement.dto.response.ExpenditureResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.service.ExpenditureService;
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
@RequestMapping("/api/expenditures")
public class ExpenditureController {

    private final ExpenditureService expenditureService;

    public ExpenditureController(ExpenditureService expenditureService) {
        this.expenditureService = expenditureService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ExpenditureResponse>>> getExpenditures(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expenditureDate,desc") String[] sort
    ) {
        Sort.Direction direction = sort.length > 1 && sort[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        PageResponse<ExpenditureResponse> response = expenditureService.getExpenditures(baseId, equipmentTypeId, search, fromDate, toDate, pageable);
        return ResponseEntity.ok(ApiResponse.success("Expenditures retrieved", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenditureResponse>> getExpenditureById(@PathVariable Long id) {
        ExpenditureResponse response = expenditureService.getExpenditureById(id);
        return ResponseEntity.ok(ApiResponse.success("Expenditure retrieved", response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER')")
    public ResponseEntity<ApiResponse<ExpenditureResponse>> createExpenditure(@Valid @RequestBody ExpenditureRequest request) {
        ExpenditureResponse response = expenditureService.createExpenditure(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Expenditure recorded successfully", response));
    }
}
