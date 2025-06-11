package com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Sort;

import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathBuilder;

public class QueryUtils {

	public static OrderSpecifier<?>[] getOrderSpecifier(Sort sort, Path<?> path) {
		List<OrderSpecifier<?>> orders = new ArrayList<>();

		// Sort가 지정되지 않은 경우 기본 정렬 반환
		if (sort == null || sort.isEmpty()) {
			return new OrderSpecifier[0];
		}

		// 엔티티 타입을 추출
		Class<?> type = path.getType();

		// 경로 빌더 생성
		PathBuilder<?> pathBuilder = new PathBuilder<>(type, path.getMetadata().getName());

		// Sort 객체를 기반으로 OrderSpecifier 생성
		sort.forEach(order -> {
			Order direction = order.isAscending() ? Order.ASC : Order.DESC;
			String property = order.getProperty();
			// PathBuilder를 사용하여 올바른 Expression 타입 생성
			orders.add(new OrderSpecifier(direction, pathBuilder.get(property)));
		});

		return orders.toArray(new OrderSpecifier[0]);
	}
}
