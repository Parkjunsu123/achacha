package com.eurachacha.achacha.application.port.input.sharebox.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ShareBoxResponseDto {
	private Integer shareBoxId;
	private String shareBoxName;
	private Integer shareBoxUserId;
	private String shareBoxUserName;
	private Integer gifticonCount;
}
