package com.eurachacha.achacha.application.port.output.sharebox;

import java.util.List;

import com.eurachacha.achacha.domain.model.sharebox.Participation;

public interface ParticipationRepository {
	boolean checkParticipation(Integer userId, Integer shareBoxId);

	Participation save(Participation participation);

	// 쉐어박스 참여자 수 조회
	int countByShareboxId(Integer shareBoxId);

	List<Participation> findByShareBoxId(Integer shareBoxId);

	void deleteByUserIdAndShareBoxId(Integer userId, Integer shareBoxId);

	void deleteAllByShareBoxId(Integer shareBoxId);

	List<Participation> findAllByUserId(Integer userId);
}
