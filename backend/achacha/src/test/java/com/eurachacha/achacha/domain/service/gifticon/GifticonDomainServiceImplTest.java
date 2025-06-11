package com.eurachacha.achacha.domain.service.gifticon;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@ExtendWith(MockitoExtension.class)
class GifticonDomainServiceImplTest {

	@InjectMocks
	private GifticonDomainServiceImpl gifticonDomainService;

	// 금액 검증 테스트 - 경계값 위주로 테스트
	@Test
	@DisplayName("금액형 기프티콘인데 금액이 null이면 예외가 발생해야 한다")
	void validateGifticonAmount_WhenAmountTypeWithNullAmount_ThenThrowException() {
		// given
		GifticonType type = GifticonType.AMOUNT;
		Integer amount = null;

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonAmount(type, amount))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_AMOUNT_GIFTICON_VALUE);
	}

	@Test
	@DisplayName("금액형 기프티콘인데 금액이 0이면 예외가 발생해야 한다")
	void validateGifticonAmount_WhenAmountTypeWithZeroAmount_ThenThrowException() {
		// given
		GifticonType type = GifticonType.AMOUNT;
		Integer amount = 0;

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonAmount(type, amount))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_AMOUNT_GIFTICON_VALUE);
	}

	@Test
	@DisplayName("금액형 기프티콘인데 금액이 양수이면 예외가 발생하지 않아야 한다")
	void validateGifticonAmount_WhenAmountTypeWithPositiveAmount_ThenNoException() {
		// given
		GifticonType type = GifticonType.AMOUNT;
		Integer amount = 1; // 경계값 - 최소 유효 금액

		// when & then
		assertThatCode(() -> gifticonDomainService.validateGifticonAmount(type, amount))
			.doesNotThrowAnyException();
	}

	@Test
	@DisplayName("상품형 기프티콘은 금액이 null이어도 예외가 발생하지 않아야 한다")
	void validateGifticonAmount_WhenProductTypeWithNullAmount_ThenNoException() {
		// given
		GifticonType type = GifticonType.PRODUCT;
		Integer amount = null;

		// when & then
		assertThatCode(() -> gifticonDomainService.validateGifticonAmount(type, amount))
			.doesNotThrowAnyException();
	}

	// 기프티콘 유효기간 검증 테스트 - 새로 추가된 메서드
	@Test
	@DisplayName("유효기간이 현재 날짜보다 이전이면 예외가 발생해야 한다")
	void validateGifticonExpiryDate_WhenExpiryDateBeforeCurrentDate_ThenThrowException() {
		// given
		LocalDate expiryDate = LocalDate.of(2025, 5, 12);
		LocalDate currentDate = LocalDate.of(2025, 5, 13);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonExpiryDate(expiryDate, currentDate))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_EXPIRED_DATE);
	}

	@Test
	@DisplayName("유효기간이 현재 날짜와 같으면 예외가 발생하지 않아야 한다")
	void validateGifticonExpiryDate_WhenExpiryDateEqualsCurrentDate_ThenNoException() {
		// given
		LocalDate expiryDate = LocalDate.of(2025, 5, 13);
		LocalDate currentDate = LocalDate.of(2025, 5, 13);

		// when & then
		assertThatCode(() -> gifticonDomainService.validateGifticonExpiryDate(expiryDate, currentDate))
			.doesNotThrowAnyException();
	}

	@Test
	@DisplayName("유효기간이 현재 날짜보다 이후면 예외가 발생하지 않아야 한다")
	void validateGifticonExpiryDate_WhenExpiryDateAfterCurrentDate_ThenNoException() {
		// given
		LocalDate expiryDate = LocalDate.of(2025, 5, 14);
		LocalDate currentDate = LocalDate.of(2025, 5, 13);

		// when & then
		assertThatCode(() -> gifticonDomainService.validateGifticonExpiryDate(expiryDate, currentDate))
			.doesNotThrowAnyException();
	}

	// 사용자 접근 권한 테스트
	@ParameterizedTest
	@CsvSource({
		"1, 1, true",
		"1, 2, false",
		"2, 1, false"
	})
	@DisplayName("요청 사용자 ID와 기프티콘 사용자 ID가 일치하면 접근 권한이 있다고 판단해야 한다")
	void hasAccess_WhenUserIdsMatch_ThenReturnTrueOtherwiseFalse(Integer requestUserId, Integer gifticonUserId,
		boolean expected) {
		// given
		// 파라미터로 제공

		// when
		boolean result = gifticonDomainService.hasAccess(requestUserId, gifticonUserId);

		// then
		assertThat(result).isEqualTo(expected);
	}

	// validateGifticonIsAvailable 메서드 테스트 (validateGifticonAvailability를 대체)
	@Test
	@DisplayName("삭제된 기프티콘 검증 시 예외가 발생해야 한다")
	void validateGifticonIsAvailable_WhenGifticonIsDeleted_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(true);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonIsAvailable(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_DELETED);
	}

	@Test
	@DisplayName("사용된 기프티콘 검증 시 예외가 발생해야 한다")
	void validateGifticonIsAvailable_WhenGifticonIsUsed_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(true);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonIsAvailable(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_ALREADY_USED);
	}

	@Test
	@DisplayName("사용 가능한 기프티콘 검증 시 예외가 발생하지 않아야 한다")
	void validateGifticonIsAvailable_WhenGifticonIsAvailable_ThenNoException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(false);

		// when & then
		assertThatCode(() -> gifticonDomainService.validateGifticonIsAvailable(gifticon))
			.doesNotThrowAnyException();
	}

	// validateGifticonIsUsed 메서드에 대한 핵심 테스트 (부정 케이스만)
	@Test
	@DisplayName("사용된 기프티콘 검증 시 사용된 기프티콘이 아니면 예외가 발생해야 한다")
	void validateGifticonIsUsed_WhenGifticonIsNotUsed_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(false);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonIsUsed(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_AVAILABLE);
	}

	// isDeleted, isUsed 메서드 테스트
	@Test
	@DisplayName("삭제된 기프티콘은 삭제됨으로 판단해야 한다")
	void isDeleted_WhenGifticonIsDeleted_ThenReturnTrue() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(true);

		// when
		boolean result = gifticonDomainService.isDeleted(gifticon);

		// then
		assertThat(result).isTrue();
	}

	@Test
	@DisplayName("사용된 기프티콘은 사용됨으로 판단해야 한다")
	void isUsed_WhenGifticonIsUsed_ThenReturnTrue() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsUsed()).willReturn(true);

		// when
		boolean result = gifticonDomainService.isUsed(gifticon);

		// then
		assertThat(result).isTrue();
	}

	// isAlreadyShared 메서드 테스트
	@Test
	@DisplayName("기프티콘에 쉐어박스가 설정된 경우 이미 공유된 것으로 판단해야 한다")
	void isAlreadyShared_WhenShareBoxExists_ThenReturnTrue() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		ShareBox shareBox = mock(ShareBox.class);
		given(gifticon.getSharebox()).willReturn(shareBox);

		// when
		boolean result = gifticonDomainService.isAlreadyShared(gifticon);

		// then
		assertThat(result).isTrue();
	}

	@Test
	@DisplayName("기프티콘에 쉐어박스가 설정되지 않은 경우 공유되지 않은 것으로 판단해야 한다")
	void isAlreadyShared_WhenShareBoxNotExists_ThenReturnFalse() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getSharebox()).willReturn(null);

		// when
		boolean result = gifticonDomainService.isAlreadyShared(gifticon);

		// then
		assertThat(result).isFalse();
	}

	// isAmountGifticonUsed 메서드 테스트
	@Test
	@DisplayName("금액형 기프티콘의 원래 금액과 남은 금액이 다른 경우 사용된 것으로 판단해야 한다")
	void isAmountGifticonUsed_WhenAmountGifticonWithDifferentAmounts_ThenReturnTrue() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getType()).willReturn(GifticonType.AMOUNT);
		given(gifticon.getOriginalAmount()).willReturn(10000);
		given(gifticon.getRemainingAmount()).willReturn(5000);

		// when
		boolean result = gifticonDomainService.isAmountGifticonUsed(gifticon);

		// then
		assertThat(result).isTrue();
	}

	@Test
	@DisplayName("금액형 기프티콘의 원래 금액과 남은 금액이 같은 경우 사용되지 않은 것으로 판단해야 한다")
	void isAmountGifticonUsed_WhenAmountGifticonWithSameAmounts_ThenReturnFalse() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getType()).willReturn(GifticonType.AMOUNT);
		given(gifticon.getOriginalAmount()).willReturn(10000);
		given(gifticon.getRemainingAmount()).willReturn(10000);

		// when
		boolean result = gifticonDomainService.isAmountGifticonUsed(gifticon);

		// then
		assertThat(result).isFalse();
	}

	@Test
	@DisplayName("상품형 기프티콘은 항상 사용되지 않은 것으로 판단해야 한다")
	void isAmountGifticonUsed_WhenProductGifticon_ThenReturnFalse() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getType()).willReturn(GifticonType.PRODUCT);

		// when
		boolean result = gifticonDomainService.isAmountGifticonUsed(gifticon);

		// then
		assertThat(result).isFalse();
	}

	// validateGifticonSharable 메서드 테스트
	@Test
	@DisplayName("삭제된 기프티콘은 공유할 수 없어야 한다")
	void validateGifticonSharable_WhenGifticonIsDeleted_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(true);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonSharable(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_DELETED);
	}

	@Test
	@DisplayName("사용된 기프티콘은 공유할 수 없어야 한다")
	void validateGifticonSharable_WhenGifticonIsUsed_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(true);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonSharable(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_ALREADY_USED);
	}

	@Test
	@DisplayName("이미 공유된 기프티콘은 다시 공유할 수 없어야 한다")
	void validateGifticonSharable_WhenGifticonIsAlreadyShared_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		ShareBox shareBox = mock(ShareBox.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(false);
		given(gifticon.getSharebox()).willReturn(shareBox);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonSharable(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_ALREADY_SHARED);
	}

	@Test
	@DisplayName("일부 사용된 금액형 기프티콘은 공유할 수 없어야 한다")
	void validateGifticonSharable_WhenAmountGifticonIsPartiallyUsed_ThenThrowException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(false);
		given(gifticon.getSharebox()).willReturn(null);
		given(gifticon.getType()).willReturn(GifticonType.AMOUNT);
		given(gifticon.getOriginalAmount()).willReturn(10000);
		given(gifticon.getRemainingAmount()).willReturn(5000);

		// when & then
		assertThatThrownBy(() -> gifticonDomainService.validateGifticonSharable(gifticon))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.CANNOT_SHARE_USED_AMOUNT_GIFTICON);
	}

	@Test
	@DisplayName("사용 가능한 기프티콘은 공유할 수 있어야 한다")
	void validateGifticonSharable_WhenGifticonIsSharable_ThenNoException() {
		// given
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getIsDeleted()).willReturn(false);
		given(gifticon.getIsUsed()).willReturn(false);
		given(gifticon.getSharebox()).willReturn(null);
		given(gifticon.getType()).willReturn(GifticonType.AMOUNT);
		given(gifticon.getOriginalAmount()).willReturn(10000);
		given(gifticon.getRemainingAmount()).willReturn(10000);

		// when & then
		assertThatCode(() -> gifticonDomainService.validateGifticonSharable(gifticon))
			.doesNotThrowAnyException();
	}

	@Test
	@DisplayName("기프티콘이 쉐어박스에 공유되어 있는지 검증 - 기프티콘의 쉐어박스가 null이면 예외가 발생해야 한다")
	void validateGifticonSharedInShareBox_WhenShareBoxIsNull_ThenThrowException() {
		// given
		Integer shareBoxId = 1;
		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getSharebox()).willReturn(null);

		// when
		Throwable thrown = catchThrowable(() ->
			gifticonDomainService.validateGifticonSharedInShareBox(gifticon, shareBoxId));

		// then
		assertThat(thrown)
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_NOT_SHARED_IN_THIS_SHAREBOX);
	}

	@Test
	@DisplayName("기프티콘이 쉐어박스에 공유되어 있는지 검증 - 기프티콘의 쉐어박스 ID가 다르면 예외가 발생해야 한다")
	void validateGifticonSharedInShareBox_WhenShareBoxIdDifferent_ThenThrowException() {
		// given
		Integer shareBoxId = 1;
		Integer differentShareBoxId = 2;

		ShareBox differentShareBox = mock(ShareBox.class);
		given(differentShareBox.getId()).willReturn(differentShareBoxId);

		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getSharebox()).willReturn(differentShareBox);

		// when
		Throwable thrown = catchThrowable(() ->
			gifticonDomainService.validateGifticonSharedInShareBox(gifticon, shareBoxId));

		// then
		assertThat(thrown)
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_NOT_SHARED_IN_THIS_SHAREBOX);
	}

	@Test
	@DisplayName("기프티콘이 쉐어박스에 공유되어 있는지 검증 - 기프티콘의 쉐어박스 ID가 일치하면 예외가 발생하지 않아야 한다")
	void validateGifticonSharedInShareBox_WhenShareBoxIdMatch_ThenNoException() {
		// given
		Integer shareBoxId = 1;

		ShareBox shareBox = mock(ShareBox.class);
		given(shareBox.getId()).willReturn(shareBoxId);

		Gifticon gifticon = mock(Gifticon.class);
		given(gifticon.getSharebox()).willReturn(shareBox);

		// when
		Throwable thrown = catchThrowable(() ->
			gifticonDomainService.validateGifticonSharedInShareBox(gifticon, shareBoxId));

		// then
		assertThat(thrown).isNull();
	}
}
