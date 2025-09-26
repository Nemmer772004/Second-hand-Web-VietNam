# Architecture Overview

## Frontend (Next.js)
- Located in `/frontend`
- React-based UI with Server Components
- GraphQL client using Apollo
- TailwindCSS for styling
- Context-based state management

## Backend Microservices

### API Gateway
- NestJS-based GraphQL API Gateway
- Routes requests to appropriate microservices
- Handles authentication via JWT
- GraphQL schema stitching

### Auth Service
- Handles user authentication & authorization
- JWT token generation and validation
- User profile management
- PostgreSQL database for user data

### Product Service
- Product catalog management
- Product search and filtering
- Inventory management
- PostgreSQL database for product data

### Cart Service
- Shopping cart management
- Real-time cart updates
- Cart persistence
- PostgreSQL database for cart data

### AI Service
- Product recommendations
- Search optimization
- User behavior analysis
- Integration with ML models

## Data Flow
1. Client makes GraphQL request to API Gateway
2. Gateway authenticates request (if needed)
3. Gateway routes request to appropriate service(s)
4. Services process request and return data
5. Gateway aggregates responses and returns to client

## Communication
- Inter-service: gRPC
- Client-Gateway: GraphQL over HTTP
- Service-Database: TypeORM

## Deployment
- Docker containers for each service
- Kubernetes orchestration
- Environment-based configuration
- Automated CI/CD pipeline
