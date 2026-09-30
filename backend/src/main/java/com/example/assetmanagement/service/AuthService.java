package com.example.assetmanagement.service;

import com.example.assetmanagement.dto.request.LoginRequest;
import com.example.assetmanagement.dto.response.AuthResponse;
import com.example.assetmanagement.dto.response.UserResponse;

public interface AuthService {
    AuthResponse loginUser(LoginRequest request);
    AuthResponse loginAdmin(LoginRequest request);
    UserResponse getCurrentUser();
    void logout();
}
