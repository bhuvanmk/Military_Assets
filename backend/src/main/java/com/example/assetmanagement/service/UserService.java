package com.example.assetmanagement.service;

import com.example.assetmanagement.dto.request.UserRequest;
import com.example.assetmanagement.dto.response.PageResponse;
import com.example.assetmanagement.dto.response.UserResponse;
import com.example.assetmanagement.enums.Role;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse createUser(UserRequest request);
    UserResponse updateUser(Long id, UserRequest request);
    UserResponse getUserById(Long id);
    UserResponse toggleUserStatus(Long id, Boolean active);
    void resetPassword(Long id, String newPassword);
    PageResponse<UserResponse> getUsers(String search, Role role, Long baseId, Boolean active, Pageable pageable);
}
