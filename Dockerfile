# Базовый образ с JDK 23
FROM eclipse-temurin:23-jdk AS build

# Рабочая директория
WORKDIR /app

# Копируем файлы Maven и исходный код
COPY mvnw .
COPY .mvn ./.mvn
COPY pom.xml .
COPY src ./src

# Собираем проект
RUN chmod +x mvnw
RUN ./mvnw dependency:resolve
RUN ./mvnw package -DskipTests

# Финальный образ для запуска
FROM eclipse-temurin:23-jre
WORKDIR /app
COPY --from=build /app/target/telegram-rpg-0.0.1-SNAPSHOT.jar app.jar

# Запуск приложения
VOLUME /app/data
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]