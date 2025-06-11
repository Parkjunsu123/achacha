package com.eurachacha.achacha.infrastructure.adapter.output.persistence.file;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.file.FileRepository;
import com.eurachacha.achacha.domain.model.file.File;
import com.eurachacha.achacha.domain.model.file.enums.FileType;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FilePersistenceAdapter implements FileRepository {

	private final FileJpaRepository fileJpaRepository;

	@Override
	public File save(File file) {
		return fileJpaRepository.save(file);
	}

	@Override
	public Optional<File> findByReferenceEntityTypeAndReferenceEntityIdAndType(
		String referenceEntityType, Integer referenceEntityId, FileType type) {
		return fileJpaRepository.findByReferenceEntityTypeAndReferenceEntityIdAndType(
			referenceEntityType, referenceEntityId, type);
	}

	@Override
	public List<File> findAllByReferenceEntityTypeAndReferenceEntityId(
		String referenceEntityType, Integer referenceEntityId) {
		return fileJpaRepository.findAllByReferenceEntityTypeAndReferenceEntityId(
			referenceEntityType, referenceEntityId);
	}

	@Override
	public List<File> findAllByReferenceEntityTypeAndReferenceEntityIdInAndType(String referenceEntityType,
		List<Integer> ids, FileType type) {
		return fileJpaRepository.findAllByReferenceEntityTypeAndReferenceEntityIdInAndType(referenceEntityType, ids,
			type);
	}

	@Override
	public void delete(File file) {
		fileJpaRepository.delete(file);
	}
}