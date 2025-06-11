package com.eurachacha.achacha.domain.model.common;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;

@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class TimeStampEntity {

	@CreatedDate
	@Column(name = "created_at")
	protected LocalDateTime createdAt;

	@LastModifiedDate
	@Column(name = "updated_at")
	protected LocalDateTime updatedAt;
}
