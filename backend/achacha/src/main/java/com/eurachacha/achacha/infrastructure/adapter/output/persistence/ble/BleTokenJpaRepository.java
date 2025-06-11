package com.eurachacha.achacha.infrastructure.adapter.output.persistence.ble;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.ble.BleToken;

@Repository
public interface BleTokenJpaRepository extends JpaRepository<BleToken, Integer> {
	void deleteByUserIdAndValue(Integer userId, String value);

	boolean existsByValue(String value);

	@Query("""
		select bt
		from BleToken bt
		join fetch bt.user
		where bt.value = :value
		""")
	BleToken findByValue(@Param("value") String value);

	@Query("SELECT b.value FROM BleToken b WHERE b.value IN :uuids")
	List<String> findValuesByValueIn(List<String> uuids);
}
