package com.eurachacha.achacha.infrastructure.adapter.output.persistence.present;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.present.PresentCard;

@Repository
public interface PresentCardJpaRepository extends JpaRepository<PresentCard, Integer> {

	boolean existsByCode(String code);

	@Query("""
		SELECT p
		FROM PresentCard p
		JOIN FETCH p.presentTemplate
		JOIN FETCH p.gifticon
		LEFT JOIN FETCH p.colorPalette
		WHERE p.code = :code
		""")
	Optional<PresentCard> findByCodeWithDetails(String code);

	void deleteByGifticonId(Integer gifticonId);
}
