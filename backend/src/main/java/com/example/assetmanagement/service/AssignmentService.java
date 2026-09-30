package com.example.assetmanagement.service;

import com.example.assetmanagement.dto.request.AssignmentRequest;
import com.example.assetmanagement.dto.response.AssignmentResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface AssignmentService {
    AssignmentResponse createAssignment(AssignmentRequest request);
    AssignmentResponse getAssignmentById(Long id);
    PageResponse<AssignmentResponse> getAssignments(Long baseId, Long equipmentTypeId, String search, LocalDate fromDate, LocalDate toDate, Pageable pageable);
}
