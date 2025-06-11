package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
// @AllArgsConstructor // 이후에 필드가 생기면, 해제 할 것
@Builder
public class GifticonResponseDto {
	public static GifticonResponseDto from(Gifticon gifticon) {
		return null;
	}
}
