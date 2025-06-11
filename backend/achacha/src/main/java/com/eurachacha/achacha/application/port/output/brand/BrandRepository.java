package com.eurachacha.achacha.application.port.output.brand;

import java.util.List;
import java.util.Optional;

import com.eurachacha.achacha.domain.model.brand.Brand;

public interface BrandRepository {
	List<Brand> findByNameContaining(String keyword);

	Optional<Brand> findByNameEquals(String name);

	Brand findById(Integer id);
}
