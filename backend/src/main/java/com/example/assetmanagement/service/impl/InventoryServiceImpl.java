package com.example.assetmanagement.service.impl;

import com.example.assetmanagement.dto.response.InventoryItemResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.entity.Base;
import com.example.assetmanagement.entity.EquipmentType;
import com.example.assetmanagement.entity.InventoryOpeningBalance;
import com.example.assetmanagement.enums.TransferStatus;
import com.example.assetmanagement.exception.ResourceNotFoundException;
import com.example.assetmanagement.repository.*;
import com.example.assetmanagement.security.AuthorizationService;
import com.example.assetmanagement.service.InventoryService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryServiceImpl implements InventoryService {

    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final InventoryOpeningBalanceRepository openingBalanceRepository;
    private final PurchaseRepository purchaseRepository;
    private final TransferRepository transferRepository;
    private final AssignmentRepository assignmentRepository;
    private final ExpenditureRepository expenditureRepository;
    private final AuthorizationService authorizationService;

    public InventoryServiceImpl(
            BaseRepository baseRepository,
            EquipmentTypeRepository equipmentTypeRepository,
            InventoryOpeningBalanceRepository openingBalanceRepository,
            PurchaseRepository purchaseRepository,
            TransferRepository transferRepository,
            AssignmentRepository assignmentRepository,
            ExpenditureRepository expenditureRepository,
            AuthorizationService authorizationService
    ) {
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.openingBalanceRepository = openingBalanceRepository;
        this.purchaseRepository = purchaseRepository;
        this.transferRepository = transferRepository;
        this.assignmentRepository = assignmentRepository;
        this.expenditureRepository = expenditureRepository;
        this.authorizationService = authorizationService;
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryItemResponse calculateInventoryForItem(Long baseId, Long equipmentTypeId, LocalDate fromDate, LocalDate toDate) {
        Base base = baseRepository.findById(baseId)
                .orElseThrow(() -> new ResourceNotFoundException("Base not found with id: " + baseId));
        EquipmentType equipmentType = equipmentTypeRepository.findById(equipmentTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found with id: " + equipmentTypeId));

        // 1. Initial stored Opening Balance
        int initialStoredOpening = openingBalanceRepository.findByBaseIdAndEquipmentTypeId(baseId, equipmentTypeId)
                .map(InventoryOpeningBalance::getQuantity)
                .orElse(0);

        // 2. Adjust opening balance if date range starts after origin
        int openingBalance = initialStoredOpening;
        if (fromDate != null) {
            long priorPurchases = purchaseRepository.sumQuantityBeforeDate(baseId, equipmentTypeId, fromDate);
            long priorTransferIn = transferRepository.sumTransferInBeforeDate(baseId, equipmentTypeId, fromDate, TransferStatus.COMPLETED);
            long priorTransferOut = transferRepository.sumTransferOutBeforeDate(baseId, equipmentTypeId, fromDate, TransferStatus.COMPLETED);
            long priorAssigned = assignmentRepository.sumQuantityBeforeDate(baseId, equipmentTypeId, fromDate);
            long priorExpended = expenditureRepository.sumQuantityBeforeDate(baseId, equipmentTypeId, fromDate);

            // Net effect before fromDate
            openingBalance = (int) (initialStoredOpening + priorPurchases + priorTransferIn - priorTransferOut - priorAssigned - priorExpended);
        }

        // 3. Transactions within the target date range [fromDate, toDate]
        int purchases = purchaseRepository.sumQuantity(baseId, equipmentTypeId, fromDate, toDate).intValue();
        int transferIn = transferRepository.sumTransferIn(baseId, equipmentTypeId, fromDate, toDate, TransferStatus.COMPLETED).intValue();
        int transferOut = transferRepository.sumTransferOut(baseId, equipmentTypeId, fromDate, toDate, TransferStatus.COMPLETED).intValue();
        int assigned = assignmentRepository.sumQuantity(baseId, equipmentTypeId, fromDate, toDate).intValue();
        int expended = expenditureRepository.sumQuantity(baseId, equipmentTypeId, fromDate, toDate).intValue();

        // 4. Single Source of Truth Formulas:
        // Net Movement = Purchases + Transfer In - Transfer Out
        int netMovement = purchases + transferIn - transferOut;

        // Closing Balance = Opening Balance + Purchases + Transfer In - Transfer Out - Assigned - Expended
        int closingBalance = openingBalance + purchases + transferIn - transferOut - assigned - expended;

        InventoryItemResponse item = new InventoryItemResponse();
        item.setBaseId(base.getId());
        item.setBaseName(base.getName());
        item.setEquipmentTypeId(equipmentType.getId());
        item.setEquipmentTypeName(equipmentType.getName());
        item.setEquipmentCategory(equipmentType.getCategory());
        item.setUnit(equipmentType.getUnit());

        item.setOpeningBalance(openingBalance);
        item.setPurchases(purchases);
        item.setTransferIn(transferIn);
        item.setTransferOut(transferOut);
        item.setNetMovement(netMovement);
        item.setAssigned(assigned);
        item.setExpended(expended);
        item.setClosingBalance(closingBalance);
        item.setAvailableBalance(closingBalance);
        item.setFromDate(fromDate);
        item.setToDate(toDate);

        return item;
    }

    @Override
    @Transactional(readOnly = true)
    public int getAvailableBalance(Long baseId, Long equipmentTypeId) {
        InventoryItemResponse res = calculateInventoryForItem(baseId, equipmentTypeId, null, null);
        return res.getClosingBalance();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItemResponse> getAllInventoryItems(Long requestedBaseId, Long equipmentTypeId, LocalDate fromDate, LocalDate toDate) {
        Long effectiveBaseId = authorizationService.resolveEffectiveBaseId(requestedBaseId);

        List<Base> bases;
        if (effectiveBaseId != null) {
            bases = baseRepository.findById(effectiveBaseId).stream().collect(Collectors.toList());
        } else {
            bases = baseRepository.findAllByActiveTrue();
        }

        List<EquipmentType> equipmentTypes;
        if (equipmentTypeId != null) {
            equipmentTypes = equipmentTypeRepository.findById(equipmentTypeId).stream().collect(Collectors.toList());
        } else {
            equipmentTypes = equipmentTypeRepository.findAllByActiveTrue();
        }

        List<InventoryItemResponse> list = new ArrayList<>();
        for (Base base : bases) {
            for (EquipmentType eq : equipmentTypes) {
                InventoryItemResponse item = calculateInventoryForItem(base.getId(), eq.getId(), fromDate, toDate);
                list.add(item);
            }
        }
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryItemResponse> getInventory(Long requestedBaseId, Long equipmentTypeId, String search, LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        List<InventoryItemResponse> allItems = getAllInventoryItems(requestedBaseId, equipmentTypeId, fromDate, toDate);

        // Filter by search string if present (matches baseName or equipmentTypeName or category)
        if (search != null && !search.isBlank()) {
            String query = search.toLowerCase().trim();
            allItems = allItems.stream().filter(item ->
                    item.getBaseName().toLowerCase().contains(query) ||
                    item.getEquipmentTypeName().toLowerCase().contains(query) ||
                    item.getEquipmentCategory().toLowerCase().contains(query)
            ).collect(Collectors.toList());
        }

        // Apply pagination in-memory to aggregated result
        int totalElements = allItems.size();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), totalElements);

        List<InventoryItemResponse> pageContent = (start <= end && start < totalElements) ? allItems.subList(start, end) : new ArrayList<>();
        int totalPages = (int) Math.ceil((double) totalElements / pageable.getPageSize());

        return new PageResponse<>(
                pageContent,
                pageable.getPageNumber(),
                pageable.getPageSize(),
                totalElements,
                totalPages,
                pageable.getPageNumber() >= totalPages - 1
        );
    }
}
