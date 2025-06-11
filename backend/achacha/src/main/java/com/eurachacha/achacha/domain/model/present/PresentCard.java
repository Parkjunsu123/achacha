package com.eurachacha.achacha.domain.model.present;

import java.time.LocalDateTime;

import com.eurachacha.achacha.domain.model.common.TimeStampEntity;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.NotNull;
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
public class PresentCard extends TimeStampEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@Column(length = 40, nullable = false)
	private String code;

	@Column(length = 100, nullable = false)
	private String message;

	@NotNull
	@Builder.Default
	private LocalDateTime expiryDateTime = LocalDateTime.now().plusHours(24);

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@OneToOne
	@JoinColumn(name = "gifticon_id", nullable = false)
	private Gifticon gifticon;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "present_template_id", nullable = false)
	private PresentTemplate presentTemplate;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "color_palette_id")
	private ColorPalette colorPalette;
}