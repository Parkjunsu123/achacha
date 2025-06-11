package com.eurachacha.achacha.notification.config;

import java.util.concurrent.Executor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

	@Bean(name = "fcmTaskExecutor")
	public Executor fcmTaskExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

		// CPU 코어 수 확인
		int coreCount = Runtime.getRuntime().availableProcessors();

		// FCM 호출은 I/O 바운드 작업이므로 코어 수의 몇 배로 설정
		executor.setCorePoolSize(coreCount * 3);
		executor.setMaxPoolSize(coreCount * 5);
		executor.setQueueCapacity(100);
		executor.setThreadNamePrefix("fcm-");
		executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());

		executor.initialize();
		return executor;
	}
}
