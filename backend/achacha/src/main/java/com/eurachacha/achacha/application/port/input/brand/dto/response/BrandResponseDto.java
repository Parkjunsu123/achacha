package com.eurachacha.achacha.application.port.input.brand.dto.response;

import com.eurachacha.achacha.domain.model.brand.Brand;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandResponseDto {
	private Integer brandId;
	private String brandName;

	public static BrandResponseDto from(Brand brand) {
		return BrandResponseDto.builder()
			.brandId(brand.getId())
			.brandName(brand.getName())
			.build();
	}
}
