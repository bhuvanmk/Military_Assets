package com.example.assetmanagement.service.impl;

import com.example.assetmanagement.dto.response.DashboardResponse;
import com.example.assetmanagement.dto.response.InventoryItemResponse;
import com.example.assetmanagement.entity.Base;
import com.example.assetmanagement.entity.EquipmentType;
import com.example.assetmanagement.repository.BaseRepository;
import com.example.assetmanagement.repository.EquipmentTypeRepository;
import com.example.assetmanagement.security.AuthorizationService;
import com.example.assetmanagement.service.DashboardService;
import com.example.assetmanagement.service.InventoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final InventoryService inventoryService;
    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final AuthorizationService authorizationService;

    public DashboardServiceImpl(
            InventoryService inventoryService,
            BaseRepository baseRepository,
            EquipmentTypeRepository equipmentTypeRepository,
            AuthorizationService authorizationService
    ) {
        this.inventoryService = inventoryService;
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.authorizationService = authorizationService;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardData(Long requestedBaseId, Long equipmentTypeId, LocalDate fromDate, LocalDate toDate) {
        Long effectiveBaseId = authorizationService.resolveEffectiveBaseId(requestedBaseId);

        List<InventoryItemResponse> items = inventoryService.getAllInventoryItems(effectiveBaseId, equipmentTypeId, fromDate, toDate);

        // Aggregate 8 Key Metrics across all matching items
        int totalOpening = 0;
        int totalPurchases = 0;
        int totalTransferIn = 0;
        int totalTransferOut = 0;
        int totalAssigned = 0;
        int totalExpended = 0;

        for (InventoryItemResponse item : items) {
            totalOpening += item.getOpeningBalance();
            totalPurchases += item.getPurchases();
            totalTransferIn += item.getTransferIn();
            totalTransferOut += item.getTransferOut();
            totalAssigned += item.getAssigned();
            totalExpended += item.getExpended();
        }

        // Apply Single Source of Truth formulas:
        // Net Movement = Purchases + Transfer In - Transfer Out
        int netMovement = totalPurchases + totalTransferIn - totalTransferOut;

        // Closing Balance = Opening Balance + Purchases + Transfer In - Transfer Out - Assigned - Expended
        int closingBalance = totalOpening + totalPurchases + totalTransferIn - totalTransferOut - totalAssigned - totalExpended;

        DashboardResponse res = new DashboardResponse();
        res.setOpeningBalance(totalOpening);
        res.setPurchases(totalPurchases);
        res.setTransferIn(totalTransferIn);
        res.setTransferOut(totalTransferOut);
        res.setNetMovement(netMovement);
        res.setAssigned(totalAssigned);
        res.setExpended(totalExpended);
        res.setClosingBalance(closingBalance);

        res.setBaseId(effectiveBaseId);
        if (effectiveBaseId != null) {
            baseRepository.findById(effectiveBaseId).ifPresent(b -> res.setBaseName(b.getName()));
        } else {
            res.setBaseName("ALL BASES");
        }

        res.setEquipmentTypeId(equipmentTypeId);
        if (equipmentTypeId != null) {
            equipmentTypeRepository.findById(equipmentTypeId).ifPresent(eq -> res.setEquipmentTypeName(eq.getName()));
        } else {
            res.setEquipmentTypeName("ALL EQUIPMENT");
        }

        res.setFromDate(fromDate);
        res.setToDate(toDate);
        res.setInventorySummary(items);

        // Chart Data 1: Category Distribution
        Map<String, Integer> categoryTotals = new HashMap<>();
        for (InventoryItemResponse item : items) {
            String cat = item.getEquipmentCategory();
            categoryTotals.put(cat, categoryTotals.getOrDefault(cat, 0) + item.getClosingBalance());
        }
        List<Map<String, Object>> categoryList = categoryTotals.entrySet().stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("category", e.getKey());
            map.put("value", e.getValue());
            return map;
        }).collect(Collectors.toList());
        res.setCategoryDistribution(categoryList);

        // Chart Data 2: Activity breakdown
        List<Map<String, Object>> activityList = new ArrayList<>();
        for (InventoryItemResponse item : items) {
            if (item.getClosingBalance() > 0 || item.getPurchases() > 0 || item.getAssigned() > 0 || item.getExpended() > 0) {
                Map<String, Object> act = new HashMap<>();
                act.put("name", item.getEquipmentTypeName());
                act.put("base", item.getBaseName());
                act.put("purchases", item.getPurchases());
                act.put("transferIn", item.getTransferIn());
                act.put("transferOut", item.getTransferOut());
                act.put("assigned", item.getAssigned());
                act.put("expended", item.getExpended());
                act.put("closing", item.getClosingBalance());
                activityList.add(act);
            }
        }
        res.setMonthlyActivity(activityList);

        return res;
    }
}
