package com.eurachacha.achacha.domain.model.notification;

import com.eurachacha.achacha.domain.model.common.TimeStampEntity;
import com.eurachacha.achacha.domain.model.notification.enums.ExpirationCycle;
import com.eurachacha.achacha.domain.model.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
public class NotificationSetting extends TimeStampEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	@Builder.Default
	@Column(name = "is_enabled")
	private Boolean isEnabled = false;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "notification_type_id")
	private NotificationType notificationType;

	@Enumerated(EnumType.STRING)
	@Column(name = "expiration_cycle", nullable = true)
	private ExpirationCycle expirationCycle;

	public void updateIsEnabled(Boolean isEnabled) {
		this.isEnabled = isEnabled;
	}

	public void updateExpirationCycle(ExpirationCycle expirationCycle) {
		this.expirationCycle = expirationCycle;
	}

}
