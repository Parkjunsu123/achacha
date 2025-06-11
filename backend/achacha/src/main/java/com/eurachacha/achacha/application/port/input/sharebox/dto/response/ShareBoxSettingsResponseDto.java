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
public class ShareBoxSettingsResponseDto {
	private Integer shareBoxId;
	private String shareBoxName;
	private Boolean shareBoxAllowParticipation;
	private String shareBoxInviteCode;
}
