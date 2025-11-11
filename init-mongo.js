db = db.getSiblingDB('luxhome');

db.createUser({
  user: 'admin',
  pwd: 'adminpassword',
  roles: [
    {
      role: 'readWrite',
      db: 'luxhome',
    },
    {
      role: 'dbAdmin',
      db: 'luxhome',
    }
  ],
});

// Reference fields will store PostgreSQL user IDs as strings

// Create collections for main application data
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "username", "role"],
      properties: {
        email: { bsonType: "string" },
        username: { bsonType: "string" },
        role: { enum: ["user", "admin", "seller"] }
      }
    }
  }
});

db.createCollection('products', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "price", "seller_id"],
      properties: {
        name: { bsonType: "string" },
        price: { bsonType: "decimal" },
        seller_id: { bsonType: "objectId" },
        category_id: { bsonType: "objectId" },
        description: { bsonType: "string" },
        images: { bsonType: "array" },
        status: { enum: ["active", "inactive", "sold"] }
      }
    }
  }
});

db.createCollection('categories', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name"],
      properties: {
        name: { bsonType: "string" },
        parent_id: { bsonType: ["objectId", "null"] },
        description: { bsonType: "string" }
      }
    }
  }
});

db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "items", "total", "status"],
      properties: {
        user_id: { bsonType: "objectId" },
        items: { bsonType: "array" },
        total: { bsonType: "decimal" },
        status: { enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"] }
      }
    }
  }
});

db.createCollection('carts', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "items"],
      properties: {
        user_id: { bsonType: "objectId" },
        items: { bsonType: "array" }
      }
    }
  }
});

db.createCollection('reviews', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "product_id", "rating"],
      properties: {
        user_id: { bsonType: "objectId" },
        product_id: { bsonType: "objectId" },
        rating: { bsonType: "int", minimum: 1, maximum: 5 },
        comment: { bsonType: "string" }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.products.createIndex({ "name": "text", "description": "text" });
db.products.createIndex({ "category_id": 1 });
db.products.createIndex({ "seller_id": 1 });
db.orders.createIndex({ "user_id": 1 });
db.carts.createIndex({ "user_id": 1 });
db.reviews.createIndex({ "product_id": 1 });
db.reviews.createIndex({ "user_id": 1 });
