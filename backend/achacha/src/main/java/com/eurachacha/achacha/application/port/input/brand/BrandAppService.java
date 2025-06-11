package com.eurachacha.achacha.application.port.input.brand;

import java.util.List;

import com.eurachacha.achacha.application.port.input.brand.dto.response.BrandResponseDto;

public interface BrandAppService {
	List<BrandResponseDto> searchBrands(String keyword);
}
