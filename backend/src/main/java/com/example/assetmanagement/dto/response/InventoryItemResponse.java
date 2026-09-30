package com.example.assetmanagement.dto.response;

import java.time.LocalDate;

public class InventoryItemResponse {

    private Long baseId;
    private String baseName;
    private Long equipmentTypeId;
    private String equipmentTypeName;
    private String equipmentCategory;
    private String unit;
    
    private Integer openingBalance;
    private Integer purchases;
    private Integer transferIn;
    private Integer transferOut;
    private Integer netMovement;
    private Integer assigned;
    private Integer expended;
    private Integer closingBalance;
    private Integer availableBalance;

    private LocalDate fromDate;
    private LocalDate toDate;

    public InventoryItemResponse() {}

    public Long getBaseId() { return baseId; }
    public void setBaseId(Long baseId) { this.baseId = baseId; }

    public String getBaseName() { return baseName; }
    public void setBaseName(String baseName) { this.baseName = baseName; }

    public Long getEquipmentTypeId() { return equipmentTypeId; }
    public void setEquipmentTypeId(Long equipmentTypeId) { this.equipmentTypeId = equipmentTypeId; }

    public String getEquipmentTypeName() { return equipmentTypeName; }
    public void setEquipmentTypeName(String equipmentTypeName) { this.equipmentTypeName = equipmentTypeName; }

    public String getEquipmentCategory() { return equipmentCategory; }
    public void setEquipmentCategory(String equipmentCategory) { this.equipmentCategory = equipmentCategory; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

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

    public Integer getAvailableBalance() { return availableBalance; }
    public void setAvailableBalance(Integer availableBalance) { this.availableBalance = availableBalance; }

    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }

    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }
}
