package com.eurachacha.achacha.infrastructure.adapter.output.persistence.history;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.history.GifticonOwnerHistory;
import com.eurachacha.achacha.domain.model.history.enums.TransferType;

@Repository
public interface GifticonOwnerHistoryJpaRepository extends JpaRepository<GifticonOwnerHistory, Integer> {
	@Query("""
		SELECT oh
		FROM GifticonOwnerHistory oh
		WHERE oh.fromUser.id = :userId
		AND oh.gifticon.id = :gifticonId
		ORDER BY oh.createdAt DESC
		LIMIT 1
		""")
	GifticonOwnerHistory findOwnerHistoryDetailByUserIdAndGifticonId(
		@Param("userId") Integer userId,
		@Param("gifticonId") Integer gifticonId);

	@Query("""
		SELECT oh
		FROM GifticonOwnerHistory oh
		WHERE (oh.gifticon.id, oh.createdAt) IN (
		    SELECT oh2.gifticon.id, MAX(oh2.createdAt)
		    FROM GifticonOwnerHistory oh2
		    WHERE oh2.gifticon.id IN :ids
		    AND oh2.fromUser.id = :userId
		    GROUP BY oh2.gifticon.id)
		""")
	List<GifticonOwnerHistory> findLatestForEachGifticonByIdsAndFromUserId(
		@Param("ids") List<Integer> ids,
		@Param("userId") Integer userId);

	void deleteByGifticonIdAndTransferType(Integer gifticonId, TransferType transferType);
}
