package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableGifticonsResponseDto {
	private List<AvailableGifticonResponseDto> gifticons;
	private Boolean hasNextPage;
	private Integer nextPage;
}
