package com.eurachacha.achacha.application.port.output.file;

import org.springframework.web.multipart.MultipartFile;

import com.eurachacha.achacha.domain.model.file.enums.FileType;

public interface FileStoragePort {

	String uploadFile(MultipartFile file, FileType fileType, Integer entityId);

	String generateFileUrl(String fileName, FileType fileType);

	String generateFileUrl(String fileName, FileType fileType, long expirationTimeInMillis);

	void deleteFile(String filePath, FileType fileType);
}
