package com.eurachacha.achacha.domain.model.file.enums;

import lombok.Getter;

@Getter
public enum FileType {
	ORIGINAL("images/gifticons/original"),
	THUMBNAIL("images/gifticons/thumbnail"),
	BARCODE("images/gifticons/barcode"),
	PRESENT_THUMBNAIL("images/present-template/thumbnail"),
	PRESENT_CARD("images/present-template/card");

	private final String pathPrefix;

	FileType(String pathPrefix) {
		this.pathPrefix = pathPrefix;
	}
}
