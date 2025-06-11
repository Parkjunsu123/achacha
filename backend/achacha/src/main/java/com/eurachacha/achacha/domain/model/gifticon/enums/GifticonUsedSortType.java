package com.eurachacha.achacha.domain.model.gifticon.enums;

import org.springframework.data.domain.Sort;

import com.eurachacha.achacha.domain.model.common.enums.SortableEnum;

/**
 * 사용완료 기프티콘 정렬 유형 열거형
 * 사용완료 기프티콘 조회 시 정렬 옵션
 */
public enum GifticonUsedSortType implements SortableEnum {
	USED_DESC {
		@Override
		public Sort createSort() {
			return Sort.by("usedAt").descending();
		}
	};
}
