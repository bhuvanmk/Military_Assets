package com.example.assetmanagement.dto.request;

import com.example.assetmanagement.enums.TransferStatus;
import jakarta.validation.constraints.NotNull;

public class TransferStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TransferStatus status;

    private String remarks;

    public TransferStatusUpdateRequest() {}

    public TransferStatusUpdateRequest(TransferStatus status, String remarks) {
        this.status = status;
        this.remarks = remarks;
    }

    public TransferStatus getStatus() { return status; }
    public void setStatus(TransferStatus status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
