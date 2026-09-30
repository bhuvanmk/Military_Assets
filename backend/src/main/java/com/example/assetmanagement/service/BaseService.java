package com.example.assetmanagement.service;

import com.example.assetmanagement.dto.request.BaseRequest;
import com.example.assetmanagement.dto.response.BaseResponse;
import com.example.assetmanagement.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BaseService {
    BaseResponse createBase(BaseRequest request);
    BaseResponse updateBase(Long id, BaseRequest request);
    BaseResponse getBaseById(Long id);
    List<BaseResponse> getAllActiveBases();
    PageResponse<BaseResponse> getBases(String search, Boolean active, Pageable pageable);
}
