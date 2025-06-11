package com.eurachacha.achacha.infrastructure.adapter.output.persistence.sharebox;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.sharebox.ShareBoxRepository;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ShareBoxPersistenceAdapter implements ShareBoxRepository {

	private final ShareBoxJpaRepository shareBoxJpaRepository;

	@Override
	public ShareBox save(ShareBox shareBox) {
		return shareBoxJpaRepository.save(shareBox);
	}

	@Override
	public boolean existsByInviteCode(String inviteCode) {
		return shareBoxJpaRepository.existsByInviteCode(inviteCode);
	}

	@Override
	public ShareBox findById(Integer id) {
		return shareBoxJpaRepository.findByIdWithUser(id)
			.orElseThrow(() -> new CustomException(ErrorCode.SHAREBOX_NOT_FOUND));
	}

	@Override
	public ShareBox findByInviteCode(String inviteCode) {
		return shareBoxJpaRepository.findByInviteCode(inviteCode)
			.orElseThrow(() -> new CustomException(ErrorCode.SHAREBOX_NOT_FOUND));
	}

	@Override
	public boolean existsById(Integer shareBoxId) {
		return shareBoxJpaRepository.existsById(shareBoxId);
	}

	@Override
	public Slice<ShareBox> findParticipatedShareBoxes(Integer userId, Pageable pageable) {
		return shareBoxJpaRepository.findParticipatedShareBoxes(userId, pageable);
	}

	@Override
	public void delete(ShareBox shareBox) {
		shareBoxJpaRepository.delete(shareBox);
	}
}
