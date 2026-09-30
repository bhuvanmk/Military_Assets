# Military Asset Management System - Backend

Production-ready Spring Boot 3.3.4 REST API for centralized multi-base military asset logistics tracking.

## Requirements
- Java 17 or higher (tested on Java 17, 21, 26)
- Maven 3.8+
- MySQL 8.0+

## Local Execution
1. Configure `.env` in the `backend/` directory or export variables:
   ```bash
   export DB_URL="jdbc:mysql://127.0.0.1:3306/Military_Assets_DB?createDatabaseIfNotExist=true&useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC"
   export DB_USERNAME="root"
   export DB_PASSWORD="YOUR_PASSWORD"
   export JWT_SECRET="8c6f1d9e2a4b7c0d3e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b"
   ```

2. Run the application:
   ```bash
   mvn spring-boot:run
   ```

3. Run Tests:
   ```bash
   mvn test
   ```
