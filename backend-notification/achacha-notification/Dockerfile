FROM openjdk:17-jdk-slim

WORKDIR /app

# 타임존 설정
ENV TZ=Asia/Seoul

# JAR 파일 복사
COPY build/libs/*.jar app.jar

# 실행 명령어 설정
ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul", "-jar", "app.jar"]
