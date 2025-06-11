package com.eurachacha.achacha.domain.service.gifticon;

import org.springframework.stereotype.Service;

@Service
public class GifticonGiveDomainServiceImpl implements GifticonGiveDomainService {
	private static final String ALLOWED_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	private static final int INVITE_CODE_LENGTH = 36;

	@Override
	public String getAllowedCharacters() {
		return ALLOWED_CHARACTERS;
	}

	@Override
	public int getRecommendedPresentCardCodeLength() {
		return INVITE_CODE_LENGTH;
	}

}
