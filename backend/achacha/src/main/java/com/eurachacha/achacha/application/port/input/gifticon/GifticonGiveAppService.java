package com.eurachacha.achacha.application.port.input.gifticon;

import java.util.List;

import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonPresentRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonPresentResponseDto;

public interface GifticonGiveAppService {
	void giveAwayGifticon(Integer gifticonId, List<String> uuids);

	GifticonPresentResponseDto presentGifticon(Integer gifticonId, GifticonPresentRequestDto gifticonPresentRequestDto);

	void cancelPresentGifticon(Integer gifticonId);
}
