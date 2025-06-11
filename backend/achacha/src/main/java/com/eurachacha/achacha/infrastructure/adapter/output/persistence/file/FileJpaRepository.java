package com.eurachacha.achacha.infrastructure.adapter.output.persistence.file;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.file.File;
import com.eurachacha.achacha.domain.model.file.enums.FileType;

@Repository
public interface FileJpaRepository extends JpaRepository<File, Integer> {
	@Query("""
		SELECT f FROM File f
		WHERE f.referenceEntityId = :id
		AND f.referenceEntityType = :referenceType
		AND f.type = :type
		""")
	Optional<File> findFile(@Param("id") Integer referenceEntityId, @Param("referenceType") String referenceEntityType,
		@Param("type") FileType type);

	Optional<File> findByReferenceEntityTypeAndReferenceEntityIdAndType(
		String referenceEntityType, Integer referenceEntityId, FileType type);

	List<File> findAllByReferenceEntityTypeAndReferenceEntityId(
		String referenceEntityType, Integer referenceEntityId);

	List<File> findAllByReferenceEntityTypeAndReferenceEntityIdInAndType(String referenceEntityType,
		List<Integer> ids, FileType type);
}
