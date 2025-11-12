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
      productId
      category
      categoryName
      displayCategory
      image
      images
      brand
      soldCount
      legacyId
      stock
      rating
      averageRating
      reviewCount
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
      productId
      category
      categoryName
      displayCategory
      image
      images
      brand
      soldCount
      legacyId
      stock
      rating
      averageRating
      reviewCount
      reviews {
        reviewId
        star
        reviewerName
        content
        time
        variation
        likedCount
        images
        shopReply
      }
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
      productId
      category
      categoryName
      image
      images
      brand
      soldCount
      legacyId
      stock
      rating
      averageRating
      reviewCount
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
        productId
        legacyId
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
        productId
        legacyId
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
        productName
        quantity
        price
        lineTotal
      }
      totalAmount
      status
      paymentStatus
      paymentMethod
      customerName
      customerEmail
      customerPhone
      shippingAddress
      notes
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query MyOrders {
    myOrders {
      id
      userId
      items {
        productId
        productName
        quantity
        price
        lineTotal
      }
      totalAmount
      status
      paymentStatus
      paymentMethod
      shippingAddress
      notes
      confirmedAt
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
        productName
        quantity
        price
        lineTotal
      }
      totalAmount
      status
      paymentStatus
      paymentMethod
      shippingAddress
      notes
      confirmedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_VOUCHERS = gql`
  query MyVouchers {
    myVouchers {
      id
      code
      status
      discountType
      discountValue
      minOrderValue
      maxDiscountValue
      description
      validFrom
      validUntil
      usageLimit
      usageCount
      sourceOrderId
      createdAt
      updatedAt
    }
  }
`;

// Order Mutations
export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      userId
      totalAmount
      status
      paymentStatus
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
export const CONFIRM_ORDER_RECEIPT = gql`
  mutation ConfirmOrderReceipt($id: String!) {
    confirmOrderReceipt(id: $id) {
      id
      status
      paymentStatus
      updatedAt
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($id: String!) {
    cancelOrder(id: $id) {
      id
      status
      paymentStatus
      updatedAt
    }
  }
`;

export const UPDATE_ORDER = gql`
  mutation UpdateOrder($id: String!, $input: UpdateOrderInput!) {
    updateOrder(id: $id, input: $input) {
      id
      status
      paymentStatus
      updatedAt
      notes
      shippingAddress
    }
  }
`;

export const CREATE_PRODUCT_REVIEW = gql`
  mutation CreateProductReview($productId: String!, $input: CreateReviewInput!) {
    createProductReview(productId: $productId, input: $input) {
      reviewId
      productId
      reviewerName
      star
      content
      time
    }
  }
`;

export const GET_RECOMMENDATIONS = gql`
  query GetRecommendations($userId: String!, $topK: Int) {
    recommendations(userId: $userId, topK: $topK) {
      userId
      reply
      generatedAt
      items {
        productId
        productName
        productSlug
        image
        price
        score
      }
    }
  }
`;

