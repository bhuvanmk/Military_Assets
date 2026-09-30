package com.example.assetmanagement.service;

import com.example.assetmanagement.dto.request.TransferRequest;
import com.example.assetmanagement.dto.request.TransferStatusUpdateRequest;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.dto.response.TransferResponse;
import com.example.assetmanagement.enums.TransferStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface TransferService {
    TransferResponse createTransfer(TransferRequest request);
    TransferResponse updateTransferStatus(Long id, TransferStatusUpdateRequest request);
    TransferResponse getTransferById(Long id);
    PageResponse<TransferResponse> getTransfers(Long baseId, Long equipmentTypeId, TransferStatus status, String search, LocalDate fromDate, LocalDate toDate, Pageable pageable);
}
