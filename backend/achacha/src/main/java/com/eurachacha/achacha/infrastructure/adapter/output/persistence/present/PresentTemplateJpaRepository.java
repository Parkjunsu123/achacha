package com.eurachacha.achacha.infrastructure.adapter.output.persistence.present;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.present.PresentTemplate;

@Repository
public interface PresentTemplateJpaRepository extends JpaRepository<PresentTemplate, Integer> {
}
