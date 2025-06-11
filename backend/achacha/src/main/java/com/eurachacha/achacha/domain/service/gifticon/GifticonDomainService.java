package com.eurachacha.achacha.domain.service.gifticon;

import java.time.LocalDate;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

public interface GifticonDomainService {
	// 금액형 기프티콘 유효성 검증
	void validateGifticonAmount(GifticonType type, Integer amount);

	// 기프티콘 소유 여부 확인
	boolean hasAccess(Integer requestUserId, Integer gifticonUserId);

	// 기프티콘 삭제 여부 확인
	boolean isDeleted(Gifticon gifticon);

	// 기프티콘 사용 여부 확인
	boolean isUsed(Gifticon gifticon);

	// 사용된 기프티콘인지 확인
	void validateGifticonIsUsed(Gifticon gifticon);

	// 사용 가능한 기프티콘인지 확인
	void validateGifticonIsAvailable(Gifticon gifticon);

	// 이미 공유된 기프티콘인지 확인
	boolean isAlreadyShared(Gifticon gifticon);

	// 금액형 - 사용한적없는 기프티콘인지 확인
	boolean isAmountGifticonUsed(Gifticon gifticon);

	// 쉐어박스에 공유할 수 있는지 검증
	void validateGifticonSharable(Gifticon gifticon);

	// 해당 쉐어박스에 기프티콘이 올라가있는지 검증
	void validateGifticonSharedInShareBox(Gifticon gifticon, Integer shareBoxId);

	// 기프티콘 삭제에 대한 검증
	void validateGifticonForDelete(Integer userId, Gifticon gifticon);

	// 기프티콘 유효기간 검증
	void validateGifticonExpiryDate(LocalDate gifticonExpiryDate, LocalDate currentDate);

	// 기프티콘 뿌리기에 대한 검증
	void validateGifticonForGiveAway(Integer userId, Gifticon gifticon);

	// 기프티콘 선물에 대한 검증
	void validateGifticonForPresent(Integer userId, Gifticon gifticon);

	// 기프티콘 선물 취소에 대한 검증
	void validateGifticonForPresentCancel(Integer userId, Gifticon gifticon);

	// 기프티콘 타입 검증(상품형)
	void validateProductGifticonType(Gifticon gifticon);

	// 기프티콘 타입 검증(금액형)
	void validateAmountGifticonType(Gifticon gifticon);

	// 금액형 기프티콘 사용내역 조회에 대한 검증
	void validateAmountGifticonUsageHistoryForGet(Gifticon gifticon);

	// 금액형 기프티콘 사용내역 사용, 수정, 삭제에 대한 검증
	void validateAmountGifticonForCommand(Gifticon gifticon);

	// 상품형 기프티콘 사용내역 조회에 대한 검증
	void validateProductGifticonUsageHistoryForGet(Gifticon gifticon);

	// 상품형 기프티콘 사용내역 사용, 수정, 삭제에 대한 검증
	void validateProductGifticonForCommand(Gifticon gifticon);

}
