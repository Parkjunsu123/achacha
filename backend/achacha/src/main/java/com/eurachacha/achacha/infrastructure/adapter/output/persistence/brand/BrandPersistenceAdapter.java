package com.eurachacha.achacha.infrastructure.adapter.output.persistence.brand;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.application.port.output.brand.BrandRepository;
import com.eurachacha.achacha.domain.model.brand.Brand;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class BrandPersistenceAdapter implements BrandRepository {

	private final BrandJpaRepository brandJpaRepository;

	@Override
	public List<Brand> findByNameContaining(String keyword) {
		return brandJpaRepository.findByNameContainingIgnoreCaseOrderByNameAsc(keyword);
	}

	@Override
	public Optional<Brand> findByNameEquals(String name) {
		return brandJpaRepository.findByNameEqualsIgnoreCase(name);
	}

	@Override
	public Brand findById(Integer id) {
		return brandJpaRepository.findById(id)
			.orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND));
	}
}
