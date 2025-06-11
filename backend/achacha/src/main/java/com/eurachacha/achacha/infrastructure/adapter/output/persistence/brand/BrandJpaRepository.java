package com.eurachacha.achacha.infrastructure.adapter.output.persistence.brand;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eurachacha.achacha.domain.model.brand.Brand;

public interface BrandJpaRepository extends JpaRepository<Brand, Integer> {

	// LIKE 연산자를 사용한 검색 + 이름순 정렬
	List<Brand> findByNameContainingIgnoreCaseOrderByNameAsc(String keyword);

	Optional<Brand> findByNameEqualsIgnoreCase(String name);
}
