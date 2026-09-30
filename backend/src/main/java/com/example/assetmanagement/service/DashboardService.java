package com.example.assetmanagement.service;

import com.example.assetmanagement.dto.response.DashboardResponse;

import java.time.LocalDate;

public interface DashboardService {
    DashboardResponse getDashboardData(Long requestedBaseId, Long equipmentTypeId, LocalDate fromDate, LocalDate toDate);
}
