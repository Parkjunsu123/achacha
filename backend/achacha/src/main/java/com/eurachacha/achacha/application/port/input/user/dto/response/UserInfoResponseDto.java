package com.eurachacha.achacha.application.port.input.user.dto.response;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoResponseDto {
	private Integer userId;
	private String userName;
	private String socialId;
	private String socialType;
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate registeredAt;
}
