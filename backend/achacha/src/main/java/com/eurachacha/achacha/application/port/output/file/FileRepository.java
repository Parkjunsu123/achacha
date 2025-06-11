package com.eurachacha.achacha.application.port.output.file;

import java.util.List;
import java.util.Optional;

import com.eurachacha.achacha.domain.model.file.File;
import com.eurachacha.achacha.domain.model.file.enums.FileType;

public interface FileRepository {
	File save(File file);

	Optional<File> findByReferenceEntityTypeAndReferenceEntityIdAndType(
		String referenceEntityType, Integer referenceEntityId, FileType type);

	List<File> findAllByReferenceEntityTypeAndReferenceEntityId(
		String referenceEntityType, Integer referenceEntityId);

	List<File> findAllByReferenceEntityTypeAndReferenceEntityIdInAndType(
		String referenceEntityType, List<Integer> ids, FileType type);

	void delete(File file);
}
