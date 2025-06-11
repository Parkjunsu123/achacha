package com.eurachacha.achacha.domain.model.notification.enums;

import org.springframework.data.domain.Sort;

import com.eurachacha.achacha.domain.model.common.enums.SortableEnum;

public enum NotificationSortType implements SortableEnum {
	CREATED_DESC {
		@Override
		public Sort createSort() {
			return Sort.by("createdAt").descending();
		}
	};
}
