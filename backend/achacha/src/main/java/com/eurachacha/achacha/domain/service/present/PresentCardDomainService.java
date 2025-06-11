package com.eurachacha.achacha.domain.service.present;

import java.time.LocalDateTime;

public interface PresentCardDomainService {
	// 선물카드 만료 여부 검증
	void validateExpiryDateTime(LocalDateTime currentDateTime, LocalDateTime expiryDateTime);
}
