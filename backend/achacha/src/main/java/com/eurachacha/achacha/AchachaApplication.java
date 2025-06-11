package com.eurachacha.achacha;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.eurachacha.achacha.infrastructure.config.AIServiceProperties;
import com.eurachacha.achacha.infrastructure.config.AwsCloudFrontProperties;
import com.eurachacha.achacha.infrastructure.config.AwsProperties;
import com.eurachacha.achacha.infrastructure.config.AwsS3Properties;
import com.eurachacha.achacha.infrastructure.config.ClovaOcrProperties;
import com.eurachacha.achacha.infrastructure.config.EncryptionProperties;
import com.eurachacha.achacha.infrastructure.config.JwtProperties;

@SpringBootApplication
@EnableConfigurationProperties({ClovaOcrProperties.class, AIServiceProperties.class,
	AwsProperties.class, AwsS3Properties.class, AwsCloudFrontProperties.class, JwtProperties.class,
	EncryptionProperties.class})
@EnableScheduling
public class AchachaApplication {

	public static void main(String[] args) {
		SpringApplication.run(AchachaApplication.class, args);
	}

}
