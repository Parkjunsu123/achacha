package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;

@Repository
public interface GifticonJpaRepository extends JpaRepository<Gifticon, Integer>, GifticonRepositoryCustom {
	@Query("""
		SELECT g
		FROM Gifticon g
		JOIN FETCH g.brand
		JOIN FETCH g.user
		LEFT JOIN FETCH g.sharebox
		WHERE g.id = :gifticonId
		""")
	Optional<Gifticon> findGifticonDetailById(@Param("gifticonId") Integer gifticonId);

	boolean existsByBarcode(String barcode);

	@Modifying
	@Query("""
		UPDATE Gifticon g
		SET g.sharebox = NULL
		WHERE g.sharebox.id = :shareBoxId
		""")
	void unshareAllGifticonsByShareBoxId(@Param("shareBoxId") Integer shareBoxId);

	@Modifying
	@Query("""
		UPDATE Gifticon g
		SET g.sharebox = NULL
		WHERE g.user.id = :userId
		AND g.sharebox.id = :shareBoxId
		AND g.isDeleted = false
		AND g.isUsed = false
		""")
	void unshareAllAvailableGifticonsByUserIdAndShareBoxId(@Param("userId") Integer userId,
		@Param("shareBoxId") Integer shareBoxId);

	@Query("""
		SELECT g FROM Gifticon g
		JOIN FETCH g.brand
		JOIN FETCH g.user
		LEFT JOIN FETCH g.sharebox
		WHERE g.isUsed = false
		AND g.isDeleted = false
		AND g.expiryDate IN :targetDates
		""")
	List<Gifticon> findGifticonsWithExpiryDates(@Param("targetDates") List<LocalDate> targetDates);

	@Query("""
		SELECT DISTINCT g FROM Gifticon g
		LEFT JOIN g.sharebox s
		LEFT JOIN Participation p ON p.sharebox.id = s.id
		WHERE g.expiryDate IN :expiryDates
		AND (g.user.id = :userId OR p.user.id = :userId)
		AND g.isUsed = false
		AND g.isDeleted = false
		""")
	List<Gifticon> findAllRelevantGifticonsWithExpiryDates(
		@Param("expiryDates") List<LocalDate> expiryDates,
		@Param("userId") Integer userId
	);
}
