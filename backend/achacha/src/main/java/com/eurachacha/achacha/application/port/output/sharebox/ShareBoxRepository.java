package com.eurachacha.achacha.application.port.output.sharebox;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.eurachacha.achacha.domain.model.sharebox.ShareBox;

public interface ShareBoxRepository {
	ShareBox findById(Integer id);

	ShareBox save(ShareBox shareBox);

	boolean existsByInviteCode(String inviteCode);

	ShareBox findByInviteCode(String inviteCode);

	boolean existsById(Integer shareBoxId);

	Slice<ShareBox> findParticipatedShareBoxes(Integer userId, Pageable pageable);
	
	void delete(ShareBox shareBox);
}
