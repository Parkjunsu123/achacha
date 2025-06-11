package com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.converter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.infrastructure.util.EncryptionUtil;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
@Component
public class BarcodeConverter implements AttributeConverter<String, String> {

	private final EncryptionUtil encryptionUtil;

	@Autowired
	public BarcodeConverter(@Lazy EncryptionUtil encryptionUtil) {
		this.encryptionUtil = encryptionUtil;
	}

	@Override
	public String convertToDatabaseColumn(String barcode) {
		return barcode != null ? encryptionUtil.encrypt(barcode) : null;
	}

	@Override
	public String convertToEntityAttribute(String encryptedBarcode) {
		return encryptedBarcode != null ? encryptionUtil.decrypt(encryptedBarcode) : null;
	}
}
