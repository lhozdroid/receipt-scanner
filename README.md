
# Receipt Scanner

[![Java](https://img.shields.io/badge/Java-17+-red.svg)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring--Boot-3.x-brightgreen)](https://spring.io/projects/spring-boot)
[![Build](https://img.shields.io/badge/build-Maven-blue.svg)](https://maven.apache.org/)
[![Docker](https://img.shields.io/badge/containerized-Docker-informational)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)

Receipt Scanner is a Spring Boot application designed to parse, store, and analyze scanned receipts using OpenAI services and a local database. It supports RESTful API access, scheduled data processing, and is containerized via Docker.

---

## Features

- RESTful API for uploading and retrieving receipts
- Integration with OpenAI for receipt content extraction
- Embedded SQLite database for lightweight storage
- Scheduled background tasks using Spring `@EnableScheduling`
- JSON handling via Jackson
- Configurable using environment variables and Spring profiles
- Docker support via `Dockerfile` and `compose.yml`

---

## Getting Started

### Requirements

- Java 17+
- Maven 3.6+
- Docker (optional for containerized deployment)

### Build and Run (Local)

```bash
./mvnw spring-boot:run
````

Or build a JAR:

```bash
./mvnw clean package
java -jar target/receipt-scanner-0.0.1-SNAPSHOT.jar
```

### Environment Variables

The following environment variables are used:

* `OPENAI_API_KEY`: API key for OpenAI
* `DATABASE_PATH`: Path for SQLite DB (default is `receipts.db`)

---

## Docker Deployment

### Build the image

```bash
docker build -t receipt-scanner .
```

### Run with Docker Compose

```bash
docker-compose -f compose.yml up --build
```

Configure environment variables inside `compose.yml`.

---

## Project Structure

```
src/
├── main/
│   ├── java/com/lavishlyholiday/receiptscanner/
│   │   ├── data/                                   # Domain models (e.g. Receipt, Item)
│   │   ├── service/                                # Core business logic
│   │   ├── ui/                                     # REST controllers
│   │   ├── config/                                 # OpenAI, DB, and Jackson config
│   │   └── ReceiptScannerApplication.java
│   └── resources/                                  # application.properties, static assets
├── test/                                           # Unit and integration tests
├── Dockerfile                                      # Containerization
└── compose.yml                                     # Docker Compose setup
```

---

## API Endpoints

Sample endpoints (provided via Spring REST):

* `POST /receipts/upload` — Upload receipt content
* `GET /receipts` — List all parsed receipts
* `GET /receipts/{id}` — Retrieve a specific receipt
* `GET /status` — Check health/status of the service

---

## Configuration

Typical `application.properties` example:

```properties
openai.api.key=${OPENAI_API_KEY}
database.path=receipts.db
spring.jackson.serialization.indent_output=true
```

---

## License

MIT © [lhozdroid](https://github.com/lhozdroid)