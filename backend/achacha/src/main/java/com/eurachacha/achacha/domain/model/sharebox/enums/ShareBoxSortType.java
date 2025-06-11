package com.eurachacha.achacha.domain.model.sharebox.enums;

import org.springframework.data.domain.Sort;

import com.eurachacha.achacha.domain.model.common.enums.SortableEnum;

public enum ShareBoxSortType implements SortableEnum {
	CREATED_DESC {
		@Override
		public Sort createSort() {
			return Sort.by("createdAt").descending();
		}
	},
	NAME_ASC {
		@Override
		public Sort createSort() {
			return Sort.by("name").ascending();
		}
	};
}
