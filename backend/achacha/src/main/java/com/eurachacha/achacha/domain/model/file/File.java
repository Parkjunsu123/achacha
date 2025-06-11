package com.eurachacha.achacha.domain.model.file;

import com.eurachacha.achacha.domain.model.common.TimeStampEntity;
import com.eurachacha.achacha.domain.model.file.enums.FileType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Getter
public class File extends TimeStampEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	private String path;

	@Column(length = 32)
	@Enumerated(EnumType.STRING)
	private FileType type;

	private String referenceEntityType;

	private Integer referenceEntityId;

}
