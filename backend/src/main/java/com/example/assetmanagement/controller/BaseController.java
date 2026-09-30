package com.example.assetmanagement.controller;

import com.example.assetmanagement.dto.response.ApiResponse;
import com.example.assetmanagement.dto.response.BaseResponse;
import com.example.assetmanagement.service.BaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bases")
public class BaseController {

    private final BaseService baseService;

    public BaseController(BaseService baseService) {
        this.baseService = baseService;
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<BaseResponse>>> getActiveBases() {
        List<BaseResponse> response = baseService.getAllActiveBases();
        return ResponseEntity.ok(ApiResponse.success("Active bases retrieved", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BaseResponse>> getBaseById(@PathVariable Long id) {
        BaseResponse response = baseService.getBaseById(id);
        return ResponseEntity.ok(ApiResponse.success("Base details retrieved", response));
    }
}
