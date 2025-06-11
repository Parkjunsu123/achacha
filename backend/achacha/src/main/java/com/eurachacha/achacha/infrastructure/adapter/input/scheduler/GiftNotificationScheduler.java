package com.eurachacha.achacha.infrastructure.adapter.input.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.input.notification.GifticonExpiryNotificationAppService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GiftNotificationScheduler {

	private final GifticonExpiryNotificationAppService gifticonExpiryNotificationAppService;

	// @Scheduled(cron = "0 0 9 * * *") // 기존 반복 시간 (매일 아침 9시)
	@Scheduled(cron = "0 0 */1 * * *")
	public void expirationScheduler() {
		gifticonExpiryNotificationAppService.sendExpiryDateNotification();
	}
}
