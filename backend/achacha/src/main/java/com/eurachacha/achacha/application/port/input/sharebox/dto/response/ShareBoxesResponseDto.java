package com.eurachacha.achacha.application.port.input.sharebox.dto.response;

import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ShareBoxesResponseDto {
	private List<ShareBoxResponseDto> shareBoxes;
	private boolean hasNextPage;
	private Integer nextPage;
}
