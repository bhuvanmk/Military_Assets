package com.example.assetmanagement.service;

import com.example.assetmanagement.dto.request.PurchaseRequest;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.dto.response.PurchaseResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface PurchaseService {
    PurchaseResponse createPurchase(PurchaseRequest request);
    PurchaseResponse getPurchaseById(Long id);
    PageResponse<PurchaseResponse> getPurchases(Long baseId, Long equipmentTypeId, String search, LocalDate fromDate, LocalDate toDate, Pageable pageable);
}
