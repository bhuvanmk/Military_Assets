package com.example.assetmanagement.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class InventoryOpeningBalanceRequest {

    @NotNull(message = "Base is required")
    private Long baseId;

    @NotNull(message = "Equipment type is required")
    private Long equipmentTypeId;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Opening quantity cannot be negative")
    private Integer quantity;

    @NotNull(message = "Effective date is required")
    private LocalDate effectiveDate;

    public InventoryOpeningBalanceRequest() {}

    public InventoryOpeningBalanceRequest(Long baseId, Long equipmentTypeId, Integer quantity, LocalDate effectiveDate) {
        this.baseId = baseId;
        this.equipmentTypeId = equipmentTypeId;
        this.quantity = quantity;
        this.effectiveDate = effectiveDate;
    }

    public Long getBaseId() { return baseId; }
    public void setBaseId(Long baseId) { this.baseId = baseId; }

    public Long getEquipmentTypeId() { return equipmentTypeId; }
    public void setEquipmentTypeId(Long equipmentTypeId) { this.equipmentTypeId = equipmentTypeId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }
}
