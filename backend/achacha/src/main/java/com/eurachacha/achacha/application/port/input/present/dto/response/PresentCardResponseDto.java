package com.eurachacha.achacha.application.port.input.present.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PresentCardResponseDto {

	private String presentCardCode;
	private String presentCardMessage;
	private String gifticonOriginalPath;
	private String gifticonThumbnailPath;
	private String templateCardPath;

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private LocalDateTime expiryDateTime;
}