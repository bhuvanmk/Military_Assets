package com.example.assetmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BaseRequest {

    @NotBlank(message = "Base name is required")
    @Size(max = 100, message = "Base name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Base location is required")
    @Size(max = 200, message = "Location cannot exceed 200 characters")
    private String location;

    private String description;
    private Boolean active = true;

    public BaseRequest() {}

    public BaseRequest(String name, String location, String description, Boolean active) {
        this.name = name;
        this.location = location;
        this.description = description;
        this.active = active != null ? active : true;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
