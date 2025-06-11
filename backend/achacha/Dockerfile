# 1. Java 베이스 이미지 사용 (JDK 17 Slim 버전)
FROM openjdk:17-jdk-slim

# 2. 작업 디렉토리 생성 및 설정
WORKDIR /app

# 3. 타임존 설정 (한국 시간)
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 4. 빌드된 JAR 파일 복사
COPY build/libs/achacha-0.0.1-SNAPSHOT.jar app.jar

# 5. 포트 노출
#EXPOSE 8080

# 6. 애플리케이션 실행 명령어 (한국 시간 설정)
ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul", "-Dspring.profiles.active=prod", "-jar", "app.jar"]