package com.eurachacha.achacha.application.service.brand;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.brand.BrandAppService;
import com.eurachacha.achacha.application.port.input.brand.dto.response.BrandResponseDto;
import com.eurachacha.achacha.application.port.output.brand.BrandRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrandAppServiceImpl implements BrandAppService {
	private final BrandRepository brandRepository;

	@Override
	public List<BrandResponseDto> searchBrands(String keyword) {
		if (keyword == null || keyword.trim().isEmpty()) {
			return List.of();
		}

		return brandRepository.findByNameContaining(keyword).stream()
			.map(BrandResponseDto::from)
			.toList();
	}
}
