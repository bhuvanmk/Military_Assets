package com.example.assetmanagement.service;

import com.example.assetmanagement.dto.request.ExpenditureRequest;
import com.example.assetmanagement.dto.response.ExpenditureResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface ExpenditureService {
    ExpenditureResponse createExpenditure(ExpenditureRequest request);
    ExpenditureResponse getExpenditureById(Long id);
    PageResponse<ExpenditureResponse> getExpenditures(Long baseId, Long equipmentTypeId, String search, LocalDate fromDate, LocalDate toDate, Pageable pageable);
}
