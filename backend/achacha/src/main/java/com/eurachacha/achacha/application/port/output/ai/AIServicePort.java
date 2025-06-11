package com.eurachacha.achacha.application.port.output.ai;

import com.eurachacha.achacha.application.port.output.ai.dto.response.GifticonMetadataDto;

public interface AIServicePort {
	GifticonMetadataDto extractGifticonInfo(String ocrResult, String gifticonType);
}
