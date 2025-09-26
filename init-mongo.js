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

// Create some initial collections
db.createCollection('products');
db.createCollection('users');
db.createCollection('carts');
