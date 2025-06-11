package com.eurachacha.achacha.notification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.eurachacha.achacha.notification.config.FirebaseProperties;

@SpringBootApplication
@EnableConfigurationProperties({FirebaseProperties.class})
public class AchachaNotificationApplication {

	public static void main(String[] args) {
		SpringApplication.run(AchachaNotificationApplication.class, args);
	}

}
