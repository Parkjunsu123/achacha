package com.eurachacha.achacha.infrastructure.adapter.output.persistence.sharebox;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.domain.model.sharebox.Participation;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ParticipationPersistenceAdapter implements ParticipationRepository {

	private final ParticipationJpaRepository participationJpaRepository;

	@Override
	public boolean checkParticipation(Integer userId, Integer shareBoxId) {
		return participationJpaRepository.existsByUserIdAndShareboxId(userId, shareBoxId);
	}

	@Override
	public Participation save(Participation participation) {
		return participationJpaRepository.save(participation);
	}

	@Override
	public int countByShareboxId(Integer shareBoxId) {
		return participationJpaRepository.countByShareboxId(shareBoxId);
	}

	@Override
	public List<Participation> findByShareBoxId(Integer shareBoxId) {
		return participationJpaRepository.findByShareboxId(shareBoxId);
	}

	@Override
	public void deleteByUserIdAndShareBoxId(Integer userId, Integer shareBoxId) {
		participationJpaRepository.deleteByUserIdAndShareboxId(userId, shareBoxId);
	}

	@Override
	public void deleteAllByShareBoxId(Integer shareBoxId) {
		participationJpaRepository.deleteByShareboxId(shareBoxId);
	}

	@Override
	public List<Participation> findAllByUserId(Integer userId) {
		return participationJpaRepository.findAllByUserId(userId);
	}
}
