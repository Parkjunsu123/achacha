package com.eurachacha.achacha.domain.model.user;

import com.eurachacha.achacha.domain.model.common.TimeStampEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 도메인 모델
 * 사용자 정보와 비즈니스 로직
 */
@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
public class User extends TimeStampEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	private String provider;

	private String providerUserId;

	private String name;

	@Builder.Default
	private Boolean isDeleted = false;

	/**
	 * 사용자 논리 삭제 메서드
	 * 사용자를 삭제 상태로 변경
	 */
	public void delete() {
		this.isDeleted = true;
	}

	public void updateName(String name) {
		this.name = name;
	}
}
