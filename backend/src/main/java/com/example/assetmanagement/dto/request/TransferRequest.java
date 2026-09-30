package com.example.assetmanagement.dto.request;

import com.example.assetmanagement.enums.TransferStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class TransferRequest {

    @NotNull(message = "From Base ID is required")
    private Long fromBaseId;

    @NotNull(message = "To Base ID is required")
    private Long toBaseId;

    @NotNull(message = "Equipment Type ID is required")
    private Long equipmentTypeId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be greater than 0")
    private Integer quantity;

    @NotNull(message = "Transfer date is required")
    private LocalDate transferDate;

    private TransferStatus status = TransferStatus.PENDING;

    @NotBlank(message = "Reference number is required")
    @Size(max = 100, message = "Reference number cannot exceed 100 characters")
    private String referenceNumber;

    private String remarks;

    public TransferRequest() {}

    public TransferRequest(Long fromBaseId, Long toBaseId, Long equipmentTypeId, Integer quantity, LocalDate transferDate, TransferStatus status, String referenceNumber, String remarks) {
        this.fromBaseId = fromBaseId;
        this.toBaseId = toBaseId;
        this.equipmentTypeId = equipmentTypeId;
        this.quantity = quantity;
        this.transferDate = transferDate;
        this.status = status != null ? status : TransferStatus.PENDING;
        this.referenceNumber = referenceNumber;
        this.remarks = remarks;
    }

    public Long getFromBaseId() { return fromBaseId; }
    public void setFromBaseId(Long fromBaseId) { this.fromBaseId = fromBaseId; }

    public Long getToBaseId() { return toBaseId; }
    public void setToBaseId(Long toBaseId) { this.toBaseId = toBaseId; }

    public Long getEquipmentTypeId() { return equipmentTypeId; }
    public void setEquipmentTypeId(Long equipmentTypeId) { this.equipmentTypeId = equipmentTypeId; }

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
}
