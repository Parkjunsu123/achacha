package com.eurachacha.achacha.application.port.input.notification.dto.response;

import java.time.LocalDateTime;

import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class NotificationResponseDto {
	private Integer notificationId;
	private String notificationTitle;
	private String notificationContent;

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime notificationCreatedAt;

	private Boolean notificationIsRead;
	private NotificationTypeCode notificationType;

	// 참조 엔티티 정보
	private String referenceEntityType; // "gifticon" 또는 "sharebox"
	private Integer referenceEntityId;

}
