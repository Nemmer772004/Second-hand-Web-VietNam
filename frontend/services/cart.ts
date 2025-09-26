import { gql } from '@apollo/client';

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
