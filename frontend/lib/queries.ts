import { gql } from '@apollo/client';

// Product Queries
export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      slug
      name
      description
      price
      category
      displayCategory
      image
      stock
      rating
      reviews
      features
      dimensions {
        width
        height
        depth
      }
      weight
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: String!) {
    product(id: $id) {
      id
      slug
      name
      description
      price
      category
      displayCategory
      image
      stock
      rating
      reviews
      features
      dimensions {
        width
        height
        depth
      }
      weight
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($category: String!) {
    productsByCategory(category: $category) {
      id
      slug
      name
      description
      price
      category
      image
      stock
      rating
      reviews
      features
      dimensions {
        width
        height
        depth
      }
      weight
      createdAt
      updatedAt
    }
  }
`;

// Category Queries
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      description
      image
      createdAt
      updatedAt
    }
  }
`;

export const GET_CATEGORY_BY_ID = gql`
  query GetCategoryById($id: String!) {
    category(id: $id) {
      id
      name
      description
      image
      createdAt
      updatedAt
    }
  }
`;

// Cart Queries
export const GET_CART = gql`
  query GetCart {
    cart {
      id
      productId
      product {
        id
        name
        price
        image
      }
      quantity
      userId
      createdAt
      updatedAt
    }
  }
`;

// Cart Mutations
export const ADD_TO_CART = gql`
  mutation AddToCart($input: CartItemInput!) {
    addToCart(input: $input) {
      id
      productId
      quantity
      userId
      price
      product {
        id
        name
        price
        image
        stock
      }
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($id: String!, $input: UpdateCartItemInput!) {
    updateCartItem(id: $id, input: $input) {
      id
      productId
      quantity
      userId
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($id: String!) {
    removeFromCart(id: $id)
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart
  }
`;

// Order Queries
export const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      userId
      items {
        productId
        quantity
        price
      }
      totalAmount
      status
      shippingAddress
      createdAt
      updatedAt
    }
  }
`;

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($id: String!) {
    order(id: $id) {
      id
      userId
      items {
        productId
        quantity
        price
      }
      totalAmount
      status
      shippingAddress
      createdAt
      updatedAt
    }
  }
`;

// Order Mutations
export const CREATE_ORDER = gql`
  mutation CreateOrder($items: [OrderItemInput!]!, $shippingAddress: String!) {
    createOrder(items: $items, shippingAddress: $shippingAddress) {
      id
      userId
      totalAmount
      status
      createdAt
    }
  }
`;

// User Queries
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      phone
      address
      role
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    user(id: $id) {
      id
      name
      email
      phone
      address
      role
      createdAt
      updatedAt
    }
  }
`;

// User Mutations
export const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $phone: String!, $address: String!) {
    createUser(name: $name, email: $email, phone: $phone, address: $address) {
      id
      name
      email
      phone
      address
      role
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String, $email: String, $phone: String, $address: String) {
    updateUser(id: $id, name: $name, email: $email, phone: $phone, address: $address) {
      id
      name
      email
      phone
      address
      role
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      success
      message
    }
  }
`;
