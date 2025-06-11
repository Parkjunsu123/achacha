package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsedGifticonsResponseDto {
	private List<UsedGifticonResponseDto> gifticons;
	private boolean hasNextPage;
	private Integer nextPage;
}
