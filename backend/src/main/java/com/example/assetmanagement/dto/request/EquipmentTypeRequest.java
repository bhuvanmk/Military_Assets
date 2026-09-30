package com.example.assetmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EquipmentTypeRequest {

    @NotBlank(message = "Equipment name is required")
    @Size(max = 100, message = "Equipment name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category;

    @NotBlank(message = "Unit of measurement is required")
    @Size(max = 20, message = "Unit cannot exceed 20 characters")
    private String unit = "Units";

    private String description;
    private Boolean active = true;

    public EquipmentTypeRequest() {}

    public EquipmentTypeRequest(String name, String category, String unit, String description, Boolean active) {
        this.name = name;
        this.category = category;
        this.unit = unit != null ? unit : "Units";
        this.description = description;
        this.active = active != null ? active : true;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
