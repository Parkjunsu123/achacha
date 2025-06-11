package com.eurachacha.achacha.infrastructure.adapter.output.persistence.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.user.RefreshToken;

@Repository
public interface RefreshTokenJpaRepository extends JpaRepository<RefreshToken, Integer> {

	Optional<RefreshToken> findByUserIdAndValue(Integer userId, String value);

	boolean existsByUserId(Integer userId);

	@Modifying
	@Query("DELETE FROM RefreshToken r WHERE r.user.id = :userId AND r.value = :value")
	void deleteByUserIdAndValue(@Param("userId") Integer userId, @Param("value") String value);

}
