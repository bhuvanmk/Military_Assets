package com.example.assetmanagement.dto.response;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class DashboardResponse {

    // 8 Key Metric Panels
    private Integer openingBalance;
    private Integer purchases;
    private Integer transferIn;
    private Integer transferOut;
    private Integer netMovement;
    private Integer assigned;
    private Integer expended;
    private Integer closingBalance;

    // Filters Applied
    private Long baseId;
    private String baseName;
    private Long equipmentTypeId;
    private String equipmentTypeName;
    private LocalDate fromDate;
    private LocalDate toDate;

    // Additional visualizations & summaries
    private List<InventoryItemResponse> inventorySummary;
    private List<Map<String, Object>> categoryDistribution;
    private List<Map<String, Object>> monthlyActivity;

    public DashboardResponse() {}

    public Integer getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(Integer openingBalance) { this.openingBalance = openingBalance; }

    public Integer getPurchases() { return purchases; }
    public void setPurchases(Integer purchases) { this.purchases = purchases; }

    public Integer getTransferIn() { return transferIn; }
    public void setTransferIn(Integer transferIn) { this.transferIn = transferIn; }

    public Integer getTransferOut() { return transferOut; }
    public void setTransferOut(Integer transferOut) { this.transferOut = transferOut; }

    public Integer getNetMovement() { return netMovement; }
    public void setNetMovement(Integer netMovement) { this.netMovement = netMovement; }

    public Integer getAssigned() { return assigned; }
    public void setAssigned(Integer assigned) { this.assigned = assigned; }

    public Integer getExpended() { return expended; }
    public void setExpended(Integer expended) { this.expended = expended; }

    public Integer getClosingBalance() { return closingBalance; }
    public void setClosingBalance(Integer closingBalance) { this.closingBalance = closingBalance; }

    public Long getBaseId() { return baseId; }
    public void setBaseId(Long baseId) { this.baseId = baseId; }

    public String getBaseName() { return baseName; }
    public void setBaseName(String baseName) { this.baseName = baseName; }

    public Long getEquipmentTypeId() { return equipmentTypeId; }
    public void setEquipmentTypeId(Long equipmentTypeId) { this.equipmentTypeId = equipmentTypeId; }

    public String getEquipmentTypeName() { return equipmentTypeName; }
    public void setEquipmentTypeName(String equipmentTypeName) { this.equipmentTypeName = equipmentTypeName; }

    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }

    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }

    public List<InventoryItemResponse> getInventorySummary() { return inventorySummary; }
    public void setInventorySummary(List<InventoryItemResponse> inventorySummary) { this.inventorySummary = inventorySummary; }

    public List<Map<String, Object>> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(List<Map<String, Object>> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

    public List<Map<String, Object>> getMonthlyActivity() { return monthlyActivity; }
    public void setMonthlyActivity(List<Map<String, Object>> monthlyActivity) { this.monthlyActivity = monthlyActivity; }
}
