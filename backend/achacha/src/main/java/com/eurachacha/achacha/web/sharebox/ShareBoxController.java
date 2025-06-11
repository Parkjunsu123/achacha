package com.eurachacha.achacha.web.sharebox;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonsResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonsResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.ShareBoxAppService;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxCreateRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxJoinRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxNameUpdateRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.request.ShareBoxParticipationSettingRequestDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxCreateResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxParticipantsResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxSettingsResponseDto;
import com.eurachacha.achacha.application.port.input.sharebox.dto.response.ShareBoxesResponseDto;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonUsedSortType;
import com.eurachacha.achacha.domain.model.sharebox.enums.ShareBoxSortType;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/share-boxes")
@RestController
@RequiredArgsConstructor
public class ShareBoxController {

	private final ShareBoxAppService shareBoxAppService;

	// 쉐어박스 생성 엔드포인트
	@PostMapping
	public ResponseEntity<ShareBoxCreateResponseDto> createShareBox(
		@Valid @RequestBody ShareBoxCreateRequestDto requestDto) {

		ShareBoxCreateResponseDto responseDto = shareBoxAppService.createShareBox(requestDto);
		return ResponseEntity.ok(responseDto);
	}

	// 쉐어박스 참여 엔드포인트
	@PostMapping("/join")
	public ResponseEntity<String> joinShareBox(
		@Valid @RequestBody ShareBoxJoinRequestDto requestDto) {

		shareBoxAppService.joinShareBox(requestDto);
		return ResponseEntity.ok("쉐어박스에 성공적으로 참여했습니다.");
	}

	// 쉐어박스 기프티콘 공유 엔드포인트
	@PostMapping("/{shareBoxId}/gifticons/{gifticonId}")
	public ResponseEntity<String> shareGifticon(
		@PathVariable Integer shareBoxId,
		@PathVariable Integer gifticonId) {

		shareBoxAppService.shareGifticon(shareBoxId, gifticonId);
		return ResponseEntity.ok("공유 완료했습니다.");
	}

	// 쉐어박스 기프티콘 공유 해제 엔드포인트
	@DeleteMapping("/{shareBoxId}/gifticons/{gifticonId}")
	public ResponseEntity<String> unshareGifticon(
		@PathVariable Integer shareBoxId,
		@PathVariable Integer gifticonId) {

		shareBoxAppService.unshareGifticon(shareBoxId, gifticonId);
		return ResponseEntity.ok("공유 해제 완료했습니다.");
	}

	// 쉐어박스 참여자 조회
	@GetMapping("/{shareBoxId}/users")
	public ResponseEntity<ShareBoxParticipantsResponseDto> getShareBoxParticipants(
		@PathVariable Integer shareBoxId) {
		return ResponseEntity.ok(shareBoxAppService.getShareBoxParticipants(shareBoxId));
	}

	// 쉐어박스 페이징 조회
	@GetMapping
	public ResponseEntity<ShareBoxesResponseDto> getShareBoxes(
		@RequestParam(required = false, defaultValue = "CREATED_DESC") ShareBoxSortType sort,
		@RequestParam(required = false, defaultValue = "0") @Min(0) Integer page,
		@RequestParam(required = false, defaultValue = "6") @Min(1) Integer size) {
		return ResponseEntity.ok(shareBoxAppService.getShareBoxes(sort, page, size));
	}

	// 쉐어박스 참여 가능 설정
	@PatchMapping("/{shareBoxId}/participation-setting")
	public ResponseEntity<String> updateParticipationSetting(
		@PathVariable Integer shareBoxId,
		@Valid @RequestBody ShareBoxParticipationSettingRequestDto requestDto) {

		shareBoxAppService.updateParticipationSetting(shareBoxId, requestDto);
		return ResponseEntity.ok("쉐어박스 참여 설정이 변경되었습니다.");
	}

	// 쉐어박스 설정 조회
	@GetMapping("/{shareBoxId}/settings")
	public ResponseEntity<ShareBoxSettingsResponseDto> getShareBoxSettings(
		@PathVariable Integer shareBoxId) {
		return ResponseEntity.ok(shareBoxAppService.getShareBoxSettings(shareBoxId));
	}

	// 쉐어박스 이름 변경 api
	@PatchMapping("/{shareBoxId}/name")
	public ResponseEntity<String> updateShareBoxName(
		@PathVariable Integer shareBoxId,
		@Valid @RequestBody ShareBoxNameUpdateRequestDto requestDto) {

		shareBoxAppService.updateShareBoxName(shareBoxId, requestDto);
		return ResponseEntity.ok("쉐어박스 이름이 변경되었습니다.");
	}

	// 나가기 api
	@DeleteMapping("/{shareBoxId}/leave")
	public ResponseEntity<String> leaveShareBox(@PathVariable Integer shareBoxId) {
		shareBoxAppService.leaveShareBox(shareBoxId);
		return ResponseEntity.ok("쉐어박스 탈퇴가 완료되었습니다.");
	}

	// 쉐어박스 내 사용가능한 기프티콘 목록 조회
	@GetMapping("/{shareBoxId}/available-gifticons")
	public ResponseEntity<AvailableGifticonsResponseDto> getShareBoxGifticons(
		@PathVariable Integer shareBoxId,
		@RequestParam(required = false) GifticonType type,
		@RequestParam(required = false, defaultValue = "CREATED_DESC") GifticonSortType sort,
		@RequestParam(required = false, defaultValue = "0") @Min(0) Integer page,
		@RequestParam(required = false, defaultValue = "10") @Min(1) Integer size) {

		AvailableGifticonsResponseDto responseDto =
			shareBoxAppService.getShareBoxGifticons(shareBoxId, type, sort, page, size);

		return ResponseEntity.ok(responseDto);
	}

	// 쉐어박스 내 사용완료된 기프티콘 목록 조회
	@GetMapping("/{shareBoxId}/used-gifticons")
	public ResponseEntity<UsedGifticonsResponseDto> getShareBoxUsedGifticons(
		@PathVariable Integer shareBoxId,
		@RequestParam(required = false) GifticonType type,
		@RequestParam(required = false, defaultValue = "USED_DESC") GifticonUsedSortType sort,
		@RequestParam(required = false, defaultValue = "0") @Min(0) Integer page,
		@RequestParam(required = false, defaultValue = "10") @Min(1) Integer size) {

		UsedGifticonsResponseDto responseDto =
			shareBoxAppService.getShareBoxUsedGifticons(shareBoxId, type, sort, page, size);

		return ResponseEntity.ok(responseDto);
	}
}
