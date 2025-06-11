package com.eurachacha.achacha.application.port.input.gifticon;

import org.springframework.web.multipart.MultipartFile;

import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonSaveRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonsResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonBarcodeResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonMetadataResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonsResponseDto;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonUsedSortType;

public interface GifticonAppService {
	GifticonMetadataResponseDto extractGifticonMetadata(MultipartFile image, GifticonType gifticonType);

	void saveGifticon(GifticonSaveRequestDto requestDto, MultipartFile originalImage,
		MultipartFile thumbnailImage, MultipartFile barcodeImage);

	AvailableGifticonsResponseDto getAvailableGifticons(GifticonScopeType scope, GifticonType type,
		GifticonSortType sort, Integer page, Integer size);

	AvailableGifticonDetailResponseDto getAvailableGifticonDetail(Integer gifticonId);

	UsedGifticonsResponseDto getUsedGifticons(GifticonType type, GifticonUsedSortType sort, Integer page, Integer size);

	UsedGifticonDetailResponseDto getUsedGifticonDetail(Integer gifticonId);

	GifticonBarcodeResponseDto getAvailableGifticonBarcode(Integer gifticonId);

	GifticonBarcodeResponseDto getUsedGifticonBarcode(Integer gifticonId);

	void deleteGifticon(Integer gifticonId);
}
