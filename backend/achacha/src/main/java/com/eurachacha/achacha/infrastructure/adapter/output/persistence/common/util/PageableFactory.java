package com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.domain.model.common.enums.SortableEnum;

@Component
public class PageableFactory {

	public Pageable createPageable(Integer page, Integer size, SortableEnum sortType) {
		return PageRequest.of(page, size, sortType.createSort());
	}
}
