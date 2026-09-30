package com.example.assetmanagement.security;

import com.example.assetmanagement.enums.Role;
import com.example.assetmanagement.exception.AccessDeniedBusinessException;
import com.example.assetmanagement.exception.UnauthorizedBaseAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("authz")
public class AuthorizationService {

    public UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            return null;
        }
        return (UserPrincipal) authentication.getPrincipal();
    }

    public boolean isAdmin() {
        UserPrincipal user = getCurrentUser();
        return user != null && user.getRole() == Role.ADMIN;
    }

    public boolean isBaseCommander() {
        UserPrincipal user = getCurrentUser();
        return user != null && user.getRole() == Role.BASE_COMMANDER;
    }

    public boolean isLogisticsOfficer() {
        UserPrincipal user = getCurrentUser();
        return user != null && user.getRole() == Role.LOGISTICS_OFFICER;
    }

    /**
     * Enforces that non-ADMIN users can ONLY query/modify records belonging to their assigned base.
     * Throws UnauthorizedBaseAccessException if commander/logistics officer attempts to touch another base.
     */
    public void validateBaseAccess(Long targetBaseId) {
        if (targetBaseId == null) {
            return;
        }
        UserPrincipal user = getCurrentUser();
        if (user == null) {
            throw new UnauthorizedBaseAccessException("User is not authenticated");
        }

        // ADMIN has global access across all bases
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        // BASE_COMMANDER or LOGISTICS_OFFICER must match their assigned baseId
        if (user.getBaseId() == null || !user.getBaseId().equals(targetBaseId)) {
            throw new UnauthorizedBaseAccessException("Access denied. You are not authorized to access data for Base ID: " + targetBaseId);
        }
    }

    /**
     * Helper to resolve effective base ID filter based on user role.
     * - ADMIN: returns requestedBaseId (or null if none requested, meaning ALL bases)
     * - BASE_COMMANDER: MUST only access assigned base. If requestedBaseId is provided and != assignedBaseId -> 403 Forbidden. If omitted, defaults to assignedBaseId.
     * - LOGISTICS_OFFICER: defaults to assignedBaseId. If requestedBaseId != assignedBaseId -> 403 Forbidden.
     */
    public Long resolveEffectiveBaseId(Long requestedBaseId) {
        UserPrincipal user = getCurrentUser();
        if (user == null) {
            return requestedBaseId;
        }

        if (user.getRole() == Role.ADMIN) {
            return requestedBaseId;
        }

        Long assignedBaseId = user.getBaseId();
        if (requestedBaseId != null && !requestedBaseId.equals(assignedBaseId)) {
            throw new UnauthorizedBaseAccessException("Access denied: You cannot view or modify assets for Base ID: " + requestedBaseId);
        }
        return assignedBaseId;
    }
}
