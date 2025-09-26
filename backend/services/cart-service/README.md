# Cart Service

This microservice handles shopping cart functionality for the e-commerce platform.

## Features

- Add items to cart
- Update item quantities
- Remove items from cart
- Clear entire cart
- Get cart contents
- Calculate cart totals

## API Endpoints

### GET /cart?userId={userId}
Get all items in a user's cart

### GET /cart/{id}?userId={userId}
Get a specific cart item

### POST /cart
Add an item to cart

### PUT /cart/{id}?userId={userId}
Update a cart item

### DELETE /cart/{id}?userId={userId}
Remove an item from cart

### PUT /cart/{id}/quantity?userId={userId}
Update item quantity

### DELETE /cart?userId={userId}
Clear user's cart

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run start:dev
```

3. Start with Docker:
```bash
docker-compose up
```

## Environment Variables

- `PORT`: Service port (default: 3002)
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
