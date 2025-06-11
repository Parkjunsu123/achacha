package com.eurachacha.achacha.domain.service.present;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@Service
public class PresentCardDomainServiceImpl implements PresentCardDomainService {

	@Override
	public void validateExpiryDateTime(LocalDateTime currentDateTime, LocalDateTime expiryDateTime) {
		if(currentDateTime.isAfter(expiryDateTime)){
			throw new CustomException(ErrorCode.PRESENT_CARD_EXPIRED);
		}
	}
}
