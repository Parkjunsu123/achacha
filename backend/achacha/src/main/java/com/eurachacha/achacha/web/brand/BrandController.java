package com.eurachacha.achacha.web.brand;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.brand.BrandAppService;
import com.eurachacha.achacha.application.port.input.brand.dto.response.BrandResponseDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

	private final BrandAppService brandAppService;

	@GetMapping
	public ResponseEntity<List<BrandResponseDto>> searchBrands(
		@RequestParam String keyword) {
		List<BrandResponseDto> brands = brandAppService.searchBrands(keyword);
		return ResponseEntity.ok(brands);
	}
}
