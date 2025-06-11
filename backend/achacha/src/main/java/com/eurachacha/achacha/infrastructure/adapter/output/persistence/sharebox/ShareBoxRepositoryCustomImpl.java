package com.eurachacha.achacha.infrastructure.adapter.output.persistence.sharebox;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;

import com.eurachacha.achacha.domain.model.sharebox.QParticipation;
import com.eurachacha.achacha.domain.model.sharebox.QShareBox;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util.QueryUtils;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ShareBoxRepositoryCustomImpl implements ShareBoxRepositoryCustom {
	private final JPAQueryFactory jpaQueryFactory;

	@Override
	public Slice<ShareBox> findParticipatedShareBoxes(Integer userId, Pageable pageable) {
		QShareBox qShareBox = QShareBox.shareBox;
		QParticipation qParticipation = QParticipation.participation;

		// 참여중인 쉐어박스 조회
		List<ShareBox> shareBoxes = jpaQueryFactory
			.selectFrom(qShareBox)
			.join(qShareBox.user).fetchJoin() // 방장 정보를 한 번에 가져오기 위한 fetch join
			.where(qShareBox.id.in(
				JPAExpressions
					.select(qParticipation.sharebox.id)
					.from(qParticipation)
					.where(qParticipation.user.id.eq(userId))
			))
			.orderBy(QueryUtils.getOrderSpecifier(pageable.getSort(), qShareBox))
			.offset(pageable.getOffset())
			.limit(pageable.getPageSize() + 1)
			.fetch();

		boolean hasNext = shareBoxes.size() > pageable.getPageSize();
		if (hasNext) {
			shareBoxes = shareBoxes.subList(0, pageable.getPageSize());
		}

		return new SliceImpl<>(shareBoxes, pageable, hasNext);
	}
}
