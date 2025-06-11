package com.eurachacha.achacha.application.port.input.gifticon.dto.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class GifticonGiveAwayRequestDto {
	private List<String> uuids;
}
