package com.eurachacha.achacha.infrastructure.adapter.output.persistence.present;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.present.ColorPalette;

@Repository
public interface ColorPaletteJpaRepository extends JpaRepository<ColorPalette, Integer> {

	List<ColorPalette> findByPresentTemplateId(Integer templateId);
}
