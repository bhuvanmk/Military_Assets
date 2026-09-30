package com.example.assetmanagement.dto.request;

import com.example.assetmanagement.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email address required")
    @Size(max = 150, message = "Email cannot exceed 150 characters")
    private String email;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    private Long baseId;
    private Boolean active = true;

    public UserRequest() {}

    public UserRequest(String name, String email, String password, Role role, Long baseId, Boolean active) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.baseId = baseId;
        this.active = active != null ? active : true;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getBaseId() { return baseId; }
    public void setBaseId(Long baseId) { this.baseId = baseId; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
