# FabricIO Backend API

FabricIO is a backend service for a mini social network and digital distribution platform designed specifically for gamers. The platform allows users to create accounts, publish, sell, or download games, and even play web-based games directly. Additionally, it features a social feed similar to Threads, where users can share posts containing text and multiple images.

## 🚀 Features

- **User Management & Authentication:** Secure registration and login using JWT (JSON Web Tokens).
- **Game Distribution:** Upload, manage, sell, and download games.
- **Web Gaming:** Support for playing web-based games directly on the platform.
- **Social Networking:** Post articles and share updates with multiple image attachments.
- **Object Storage:** Integration with MinIO (local) and AWS S3 (production) for storing game files and images.

## 🛠️ Technology Stack

- **Framework:** ASP.NET Core Web API
- **Language:** C#
- **Database:** PostgreSQL
- **Object Storage:** MinIO (Local) / AWS S3 (Production)
- **Reverse Proxy:** Nginx
- **Containerization:** Docker & Docker Compose
- **Documentation:** Swagger / OpenAPI
- **Mapping:** AutoMapper

## 📐 Architecture & Design Patterns

- **Repository Pattern:** Abstracts data access logic, making the code more maintainable and testable.
- **Unit of Work:** Manages database transactions to ensure data integrity across multiple repository operations.
- **Soft Delete:** Implemented across entities to prevent accidental data loss and maintain historical records.

## ⚙️ Getting Started

The project uses Docker Compose to easily provision the required infrastructure (Database, MinIO, and Nginx) without manual setup.

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Installation & Execution

1.  **Clone the repository** (if you haven't already).
2.  **Start the infrastructure:**
    Navigate to the root directory where `docker-compose.yml` is located and run:
    ```bash
    docker-compose up -d
    ```
    _This command will spin up PostgreSQL, MinIO, and Nginx in the background._
3.  **Run the API:**
    Open the project in Visual Studio or use the .NET CLI:
    ```bash
    dotnet restore
    dotnet run
    ```
4.  **Explore the API:**
    Once the application is running, open your web browser and navigate to the Swagger UI to test the endpoints.
    ```bash
    https://localhost:7100/swagger/index.html
    ```

## ☁️ Deployment Plan

The production environment is planned to be deployed on AWS with the following architecture:

- **Server:** AWS EC2 instance hosting the ASP.NET Core application and Nginx.
- **Object Storage:** AWS S3 (replacing local MinIO) for scalable storage of images and game files.
- **Database:** [Neon](https://neon.tech/) (Serverless Postgres) for reliable and scalable data persistence.

## 📄 License

This project is Private. All rights reserved.
