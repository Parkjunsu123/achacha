package com.eurachacha.achacha.domain.model.gifticon.enums;

import org.springframework.data.domain.Sort;

import com.eurachacha.achacha.domain.model.common.enums.SortableEnum;

/**
 * 기프티콘 정렬 유형 열거형
 * 기프티콘 조회 시 정렬 옵션
 */
public enum GifticonSortType implements SortableEnum {
	CREATED_DESC { // 등록순

		@Override
		public Sort createSort() {
			return Sort.by("createdAt").descending();
		}
	},
	EXPIRY_ASC { // 만료순

		@Override
		public Sort createSort() {
			return Sort.by("expiryDate").ascending().and(Sort.by("id").ascending());
		}
	};
}
