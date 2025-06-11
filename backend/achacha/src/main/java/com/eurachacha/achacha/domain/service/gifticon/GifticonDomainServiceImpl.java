package com.eurachacha.achacha.domain.service.gifticon;

import java.time.LocalDate;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@Service
public class GifticonDomainServiceImpl implements GifticonDomainService {

	// 기프티콘 금액 유효성 검증
	@Override
	public void validateGifticonAmount(GifticonType type, Integer amount) {
		// 금액형 기프티콘인데 금액이 없는 경우
		if (type == GifticonType.AMOUNT && amount == null) {
			throw new CustomException(ErrorCode.INVALID_AMOUNT_GIFTICON_VALUE);
		}

		// 금액형 기프티콘인데 금액이 0 이하인 경우
		if (type == GifticonType.AMOUNT && amount <= 0) {
			throw new CustomException(ErrorCode.INVALID_AMOUNT_GIFTICON_VALUE);
		}
	}

	// 기프티콘 소유 여부 확인
	@Override
	public boolean hasAccess(Integer requestUserId, Integer gifticonUserId) {
		return Objects.equals(requestUserId, gifticonUserId);
	}

	@Override
	public boolean isDeleted(Gifticon gifticon) {
		return gifticon.getIsDeleted();
	}

	@Override
	public boolean isUsed(Gifticon gifticon) {
		return gifticon.getIsUsed();
	}

	// 사용된 기프티콘인지 확인
	@Override
	public void validateGifticonIsUsed(Gifticon gifticon) {

		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		if (!isUsed(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_AVAILABLE);
		}
	}

	// 사용 가능한 기프티콘인지 확인
	@Override
	public void validateGifticonIsAvailable(Gifticon gifticon) {
		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		if (isUsed(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_USED);
		}
	}

	// 이미 공유된 기프티콘인지 확인
	@Override
	public boolean isAlreadyShared(Gifticon gifticon) {
		return gifticon.getSharebox() != null;
	}

	// 금액형 - 사용한적없는 기프티콘인지 확인
	@Override
	public boolean isAmountGifticonUsed(Gifticon gifticon) {
		if (gifticon.getType() != GifticonType.AMOUNT) {
			return false;
		}

		return !gifticon.getOriginalAmount().equals(gifticon.getRemainingAmount());
	}

	// 쉐어박스에 공유할 수 있는지 검증
	@Override
	public void validateGifticonSharable(Gifticon gifticon) {
		// 삭제된 기프티콘인지 검증
		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		// 사용된 기프티콘인지 검증
		if (isUsed(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_USED);
		}

		// 이미 공유된 기프티콘인지 검증
		if (isAlreadyShared(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_SHARED);
		}

		// 금액형 기프티콘의 경우, 일부 사용되었는지 검증
		if (isAmountGifticonUsed(gifticon)) {
			throw new CustomException(ErrorCode.CANNOT_SHARE_USED_AMOUNT_GIFTICON);
		}
	}

	@Override
	public void validateGifticonSharedInShareBox(Gifticon gifticon, Integer shareBoxId) {
		if (gifticon.getSharebox() == null || !gifticon.getSharebox().getId().equals(shareBoxId)) {
			throw new CustomException(ErrorCode.GIFTICON_NOT_SHARED_IN_THIS_SHAREBOX);
		}
	}

	@Override
	public void validateGifticonForDelete(Integer userId, Gifticon gifticon) {

		// 삭제된 기프티콘인지 검증
		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		// 본인 소유인지 확인
		boolean isOwner = hasAccess(userId, gifticon.getUser().getId());
		if (!isOwner) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
		}

		// 쉐어박스에 공유중인지 확인
		boolean alreadyShared = isAlreadyShared(gifticon);
		if (alreadyShared) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_SHARED);
		}
	}

	@Override
	public void validateGifticonExpiryDate(LocalDate gifticonExpiryDate, LocalDate currentDate) {
		if (gifticonExpiryDate.isBefore(currentDate)) {
			throw new CustomException(ErrorCode.GIFTICON_EXPIRED_DATE);
		}
	}

	@Override
	public void validateGifticonForGiveAway(Integer userId, Gifticon gifticon) {

		// 삭제 여부
		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		// 사용 여부
		if (isUsed(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_USED);
		}

		// 유효기간
		validateGifticonExpiryDate(gifticon.getExpiryDate(), LocalDate.now());

		// 본인 소유인지 확인
		boolean isOwner = hasAccess(userId, gifticon.getUser().getId());
		if (!isOwner) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
		}

		// 쉐어박스에 공유중인지 확인
		boolean alreadyShared = isAlreadyShared(gifticon);
		if (alreadyShared) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_SHARED);
		}

		// 상품형 타입 여부
		validateProductGifticonType(gifticon);

	}

	@Override
	public void validateGifticonForPresent(Integer userId, Gifticon gifticon) {
		// 삭제 여부
		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		// 사용 여부
		if (isUsed(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_USED);
		}

		// 유효기간
		validateGifticonExpiryDate(gifticon.getExpiryDate(), LocalDate.now());

		// 본인 소유인지 확인
		boolean isOwner = hasAccess(userId, gifticon.getUser().getId());
		if (!isOwner) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
		}

		// 금액형 기프티콘의 경우, 일부 사용되었는지 검증
		if (isAmountGifticonUsed(gifticon)) {
			throw new CustomException(ErrorCode.CANNOT_SHARE_USED_AMOUNT_GIFTICON);
		}

		// 쉐어박스에 공유중인지 확인
		boolean alreadyShared = isAlreadyShared(gifticon);
		if (alreadyShared) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_SHARED);
		}
	}

	@Override
	public void validateGifticonForPresentCancel(Integer userId, Gifticon gifticon) {
		// 본인 소유인지 확인
		boolean isOwner = hasAccess(userId, gifticon.getUser().getId());
		if (!isOwner) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
		}
	}

	@Override
	public void validateProductGifticonType(Gifticon gifticon) {
		if (gifticon.getType() != GifticonType.PRODUCT) {
			throw new CustomException(ErrorCode.INVALID_GIFTICON_TYPE);
		}
	}

	@Override // 금액형 타입 검증
	public void validateAmountGifticonType(Gifticon gifticon) {
		if (gifticon.getType() != GifticonType.AMOUNT) {
			throw new CustomException(ErrorCode.INVALID_GIFTICON_TYPE);
		}
	}

	@Override
	public void validateAmountGifticonUsageHistoryForGet(Gifticon gifticon) {
		// 삭제 여부
		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		// 금액형 타입 여부
		validateAmountGifticonType(gifticon);
	}

	@Override
	public void validateAmountGifticonForCommand(Gifticon gifticon) {

		// 삭제 여부
		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		// 사용 여부
		if (isUsed(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_USED);
		}

		// 금액형 타입 여부
		validateAmountGifticonType(gifticon);
	}

	@Override
	public void validateProductGifticonUsageHistoryForGet(Gifticon gifticon) {

		// 삭제 여부
		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		// 사용 여부
		if (!isUsed(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_USED);
		}

		// 상품형 타입 여부
		validateProductGifticonType(gifticon);
	}

	@Override
	public void validateProductGifticonForCommand(Gifticon gifticon) {

		// 삭제 여부
		if (isDeleted(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		// 사용 여부
		if (isUsed(gifticon)) {
			throw new CustomException(ErrorCode.GIFTICON_ALREADY_USED);
		}

		// 상품형 타입 여부
		validateProductGifticonType(gifticon);
	}
}
