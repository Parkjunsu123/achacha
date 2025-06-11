package com.eurachacha.achacha.infrastructure.adapter.output.persistence.sharebox;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.sharebox.Participation;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;

@Repository
public interface ShareBoxJpaRepository extends JpaRepository<ShareBox, Integer>, ShareBoxRepositoryCustom {
	@Query("""
		SELECT s FROM ShareBox s
		JOIN FETCH s.user
		WHERE s.id = :id
		""")
	Optional<ShareBox> findByIdWithUser(@Param("id") Integer id);

	boolean existsByInviteCode(String inviteCode);

	Optional<ShareBox> findByInviteCode(String inviteCode);

	@Query("""
		SELECT p FROM Participation p
		JOIN FETCH p.user
		WHERE p.sharebox.id = :shareBoxId
		""")
	List<Participation> findParticipationsByShareBoxId(@Param("shareBoxId") Integer shareBoxId);
}
