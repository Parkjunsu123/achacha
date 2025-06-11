package com.eurachacha.achacha.infrastructure.adapter.output.persistence.sharebox;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.eurachacha.achacha.domain.model.sharebox.ShareBox;

public interface ShareBoxRepositoryCustom {
	Slice<ShareBox> findParticipatedShareBoxes(Integer userId, Pageable pageable);
}
