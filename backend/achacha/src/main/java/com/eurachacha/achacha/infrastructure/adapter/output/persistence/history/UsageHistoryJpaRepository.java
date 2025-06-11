package com.eurachacha.achacha.infrastructure.adapter.output.persistence.history;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.history.UsageHistory;

@Repository
public interface UsageHistoryJpaRepository extends JpaRepository<UsageHistory, Integer> {
	@Query("""
		SELECT uh
		FROM UsageHistory uh
		WHERE uh.user.id = :userId
		AND uh.gifticon.id = :gifticonId
		ORDER BY uh.createdAt DESC
		LIMIT 1
		""")
	UsageHistory findLatestByUserIdAndGifticonId(
		@Param("userId") Integer userId,
		@Param("gifticonId") Integer gifticonId);

	List<UsageHistory> findAllByGifticonIdOrderByCreatedAtDesc(Integer gifticonId);

	Optional<UsageHistory> findByIdAndGifticonIdAndUserId(Integer usageHistoryId, Integer gifticonId, Integer userId);

	@Query("""
		SELECT uh1
		FROM UsageHistory uh1
		LEFT JOIN UsageHistory uh2
		ON uh1.gifticon.id = uh2.gifticon.id
		AND uh1.createdAt < uh2.createdAt
		AND uh2.user.id = :userId
		WHERE uh1.gifticon.id IN :ids
		AND uh1.user.id = :userId
		AND uh2.id IS NULL
		""")
	List<UsageHistory> findLatestForEachGifticonByIdsAndUserId(
		@Param("ids") List<Integer> ids,
		@Param("userId") Integer userId);
}
