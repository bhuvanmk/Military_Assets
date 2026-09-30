# Root-level Multi-stage Dockerfile for Spring Boot Backend
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom and resolve offline dependencies
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

# Copy backend source code and package application
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Runtime stage with lightweight Alpine JRE
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy built artifact
COPY --from=build /app/target/*.jar app.jar

# Expose default port
EXPOSE 8080

# Launch application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
