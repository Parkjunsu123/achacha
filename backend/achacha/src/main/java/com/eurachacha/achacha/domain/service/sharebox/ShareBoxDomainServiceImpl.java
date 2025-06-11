package com.eurachacha.achacha.domain.service.sharebox;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@Service
public class ShareBoxDomainServiceImpl implements ShareBoxDomainService {

	private static final String ALLOWED_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	private static final int INVITE_CODE_LENGTH = 10;
	private static final int MAX_PARTICIPANTS = 10;
	private static final int MAX_NAME_LENGTH = 10;
	private static final int MIN_NAME_LENGTH = 1;

	@Override
	public void validateParticipationAllowed(ShareBox shareBox) {
		if (shareBox == null) {
			throw new CustomException(ErrorCode.SHAREBOX_NOT_FOUND);
		}

		if (!shareBox.getAllowParticipation()) {
			throw new CustomException(ErrorCode.SHAREBOX_PARTICIPATION_DISABLED);
		}
	}

	@Override
	public void validateParticipantCount(int currentParticipants) {
		if (currentParticipants >= MAX_PARTICIPANTS) {
			throw new CustomException(ErrorCode.SHAREBOX_MAX_PARTICIPANTS_REACHED);
		}
	}

	@Override
	public void validateShareBoxName(String name) {
		if (name == null || name.trim().isEmpty()) {
			throw new CustomException(ErrorCode.INVALID_SHAREBOX_NAME);
		}

		String trimmedName = name.trim();
		if (trimmedName.length() < MIN_NAME_LENGTH) {
			throw new CustomException(ErrorCode.INVALID_SHAREBOX_NAME);
		}

		if (trimmedName.length() > MAX_NAME_LENGTH) {
			throw new CustomException(ErrorCode.INVALID_SHAREBOX_NAME);
		}
	}

	@Override
	public String getAllowedCharacters() {
		return ALLOWED_CHARACTERS;
	}

	@Override
	public int getRecommendedInviteCodeLength() {
		return INVITE_CODE_LENGTH;
	}

	@Override
	public boolean isShareBoxOwner(ShareBox shareBox, Integer userId) {
		return shareBox.getUser().getId().equals(userId);
	}

	@Override
	public void validateShareBoxOwner(ShareBox shareBox, Integer userId) {
		if (!isShareBoxOwner(shareBox, userId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_SHAREBOX_OWNER_ACCESS);
		}
	}
}
