package com.example.assetmanagement.service;

import com.example.assetmanagement.dto.response.AuditLogResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.entity.AuditLog;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface AuditLogService {
    void log(String action, String entityType, Long entityId, String description);
    PageResponse<AuditLogResponse> getAuditLogs(String action, String entityType, Long userId, LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable);
}
