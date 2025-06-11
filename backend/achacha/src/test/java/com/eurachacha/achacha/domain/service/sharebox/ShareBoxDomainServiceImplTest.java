package com.eurachacha.achacha.domain.service.sharebox;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@ExtendWith(MockitoExtension.class)
class ShareBoxDomainServiceImplTest {

	@InjectMocks
	private ShareBoxDomainServiceImpl shareBoxDomainService;

	@Test
	@DisplayName("방장 권한 검증 - 요청 사용자가 방장이면 예외가 발생하지 않아야 한다")
	void validateShareBoxOwner_WhenUserIsOwner_ThenNoException() {
		// given
		Integer userId = 1;
		User user = User.builder().id(userId).build();

		ShareBox shareBox = mock(ShareBox.class);
		given(shareBox.getUser()).willReturn(user);

		// when
		Throwable thrown = catchThrowable(() -> shareBoxDomainService.validateShareBoxOwner(shareBox, userId));

		// then
		assertThat(thrown).isNull();
	}

	@Test
	@DisplayName("방장 권한 검증 - 요청 사용자가 방장이 아니면 예외가 발생해야 한다")
	void validateShareBoxOwner_WhenUserIsNotOwner_ThenThrowException() {
		// given
		Integer userId = 1;
		Integer ownerId = 2;
		User owner = User.builder().id(ownerId).build();

		ShareBox shareBox = mock(ShareBox.class);
		given(shareBox.getUser()).willReturn(owner);

		// when
		Throwable thrown = catchThrowable(() -> shareBoxDomainService.validateShareBoxOwner(shareBox, userId));

		// then
		assertThat(thrown)
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.UNAUTHORIZED_SHAREBOX_OWNER_ACCESS);
	}

	@Test
	@DisplayName("쉐어박스 방장 확인 - 요청 사용자가 방장이면 true를 반환해야 한다")
	void isShareBoxOwner_WhenUserIsOwner_ThenReturnTrue() {
		// given
		Integer userId = 1;
		User user = User.builder().id(userId).build();

		ShareBox shareBox = mock(ShareBox.class);
		given(shareBox.getUser()).willReturn(user);

		// when
		boolean result = shareBoxDomainService.isShareBoxOwner(shareBox, userId);

		// then
		assertThat(result).isTrue();
	}

	@Test
	@DisplayName("쉐어박스 방장 확인 - 요청 사용자가 방장이 아니면 false를 반환해야 한다")
	void isShareBoxOwner_WhenUserIsNotOwner_ThenReturnFalse() {
		// given
		Integer userId = 1;
		Integer ownerId = 2;
		User owner = User.builder().id(ownerId).build();

		ShareBox shareBox = mock(ShareBox.class);
		given(shareBox.getUser()).willReturn(owner);

		// when
		boolean result = shareBoxDomainService.isShareBoxOwner(shareBox, userId);

		// then
		assertThat(result).isFalse();
	}
}
