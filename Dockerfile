FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy the pre-built WAR file from the host
COPY target/receipt-scanner.war app.war

# Expose port 8080
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.war"]
