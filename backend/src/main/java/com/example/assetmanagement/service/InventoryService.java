package com.example.assetmanagement.service;

import com.example.assetmanagement.dto.response.InventoryItemResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface InventoryService {

    /**
     * Calculates the exact Closing Balance and Net Movement according to single source of truth:
     * Net Movement = Purchases + Transfer In - Transfer Out
     * Closing Balance = Opening Balance + Purchases + Transfer In - Transfer Out - Assigned - Expended
     */
    InventoryItemResponse calculateInventoryForItem(Long baseId, Long equipmentTypeId, LocalDate fromDate, LocalDate toDate);

    /**
     * Calculates available balance for an equipment at a base at current instant.
     * Used for validating transfers, assignments, and expenditures.
     */
    int getAvailableBalance(Long baseId, Long equipmentTypeId);

    /**
     * Retrieves paginated inventory view across bases and equipment.
     */
    PageResponse<InventoryItemResponse> getInventory(Long baseId, Long equipmentTypeId, String search, LocalDate fromDate, LocalDate toDate, Pageable pageable);

    /**
     * Retrieves list of inventory items for dashboard or summary.
     */
    List<InventoryItemResponse> getAllInventoryItems(Long baseId, Long equipmentTypeId, LocalDate fromDate, LocalDate toDate);
}
