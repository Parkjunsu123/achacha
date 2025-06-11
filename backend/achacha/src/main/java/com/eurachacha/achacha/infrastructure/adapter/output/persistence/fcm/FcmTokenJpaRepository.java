package com.eurachacha.achacha.infrastructure.adapter.output.persistence.fcm;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.fcm.FcmToken;

@Repository
public interface FcmTokenJpaRepository extends JpaRepository<FcmToken, Integer> {

	List<FcmToken> findAllByUser_Id(Integer userId);

	@Modifying
	@Query("DELETE FROM FcmToken f WHERE f.user.id = :userId AND f.value = :value")
	void deleteByUserIdAndValue(@Param("userId") Integer userId, @Param("value") String value);
}
