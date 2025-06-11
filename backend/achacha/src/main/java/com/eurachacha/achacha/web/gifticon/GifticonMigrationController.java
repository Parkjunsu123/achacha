package com.eurachacha.achacha.web.gifticon;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.service.gifticon.GifticonMigrationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/migration")
@RequiredArgsConstructor
public class GifticonMigrationController {

	private final GifticonMigrationService gifticonMigrationService;

	@PostMapping("/barcodes")
	public ResponseEntity<String> migrateBarcodes() {
		gifticonMigrationService.migrateExistingBarcodes();
		return ResponseEntity.ok("Barcodes migrated");
	}

	// /**
	//  * 테스트 기프티콘 저장 (자동 암호화)
	//  */
	// @PostMapping("/gifticon")
	// public ResponseEntity<String> saveGifticon(
	// 	@RequestParam String name,
	// 	@RequestParam String barcode) {
	// 	gifticonMigrationService.saveGifticon(name, barcode);
	// 	return ResponseEntity.ok("Gifticon saved");
	// }
	//
	// /**
	//  * 저장된 기프티콘 조회 (자동 복호화)
	//  */
	// @GetMapping("/gifticon/{id}")
	// public ResponseEntity<String> getGifticon(
	// 	@PathVariable Integer id) {
	// 	var result = gifticonMigrationService.getGifticon(id);
	// 	return ResponseEntity.ok("Gifticon: " + result.toString());
	// }

}
