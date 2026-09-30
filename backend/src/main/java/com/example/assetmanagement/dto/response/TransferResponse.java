package com.example.assetmanagement.dto.response;

import com.example.assetmanagement.enums.TransferStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TransferResponse {

    private Long id;
    private Long fromBaseId;
    private String fromBaseName;
    private Long toBaseId;
    private String toBaseName;
    private Long equipmentTypeId;
    private String equipmentTypeName;
    private String equipmentCategory;
    private String unit;
    private Integer quantity;
    private LocalDate transferDate;
    private TransferStatus status;
    private String referenceNumber;
    private String remarks;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TransferResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFromBaseId() { return fromBaseId; }
    public void setFromBaseId(Long fromBaseId) { this.fromBaseId = fromBaseId; }

    public String getFromBaseName() { return fromBaseName; }
    public void setFromBaseName(String fromBaseName) { this.fromBaseName = fromBaseName; }

    public Long getToBaseId() { return toBaseId; }
    public void setToBaseId(Long toBaseId) { this.toBaseId = toBaseId; }

    public String getToBaseName() { return toBaseName; }
    public void setToBaseName(String toBaseName) { this.toBaseName = toBaseName; }

    public Long getEquipmentTypeId() { return equipmentTypeId; }
    public void setEquipmentTypeId(Long equipmentTypeId) { this.equipmentTypeId = equipmentTypeId; }

    public String getEquipmentTypeName() { return equipmentTypeName; }
    public void setEquipmentTypeName(String equipmentTypeName) { this.equipmentTypeName = equipmentTypeName; }

    public String getEquipmentCategory() { return equipmentCategory; }
    public void setEquipmentCategory(String equipmentCategory) { this.equipmentCategory = equipmentCategory; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public LocalDate getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDate transferDate) { this.transferDate = transferDate; }

    public TransferStatus getStatus() { return status; }
    public void setStatus(TransferStatus status) { this.status = status; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
