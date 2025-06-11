package com.eurachacha.achacha.application.port.input.sharebox;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonsResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonsResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxCreateRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxJoinRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxNameUpdateRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxParticipationSettingRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxCreateResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxParticipantsResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxSettingsResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxesResponseDto;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonUsedSortType;
import com.eurachacha.achacha.domain.model.sharebox.enums.ShareBoxSortType;

public interface ShareBoxAppService {
	ShareBoxCreateResponseDto createShareBox(ShareBoxCreateRequestDto requestDto);

	void joinShareBox(ShareBoxJoinRequestDto requestDto);

	void shareGifticon(Integer shareBoxId, Integer gifticonId);

	void unshareGifticon(Integer shareBoxId, Integer gifticonId);

	ShareBoxParticipantsResponseDto getShareBoxParticipants(Integer shareBoxId);

	ShareBoxesResponseDto getShareBoxes(ShareBoxSortType sort, Integer page, Integer size);

	void updateParticipationSetting(Integer shareBoxId, ShareBoxParticipationSettingRequestDto requestDto);

	ShareBoxSettingsResponseDto getShareBoxSettings(Integer shareBoxId);

	void updateShareBoxName(Integer shareBoxId, ShareBoxNameUpdateRequestDto requestDto);

	void leaveShareBox(Integer shareBoxId);

	AvailableGifticonsResponseDto getShareBoxGifticons(Integer shareBoxId, GifticonType type,
		GifticonSortType sort, Integer page, Integer size);

	UsedGifticonsResponseDto getShareBoxUsedGifticons(Integer shareBoxId, GifticonType type,
		GifticonUsedSortType sort, Integer page, Integer size);
}
