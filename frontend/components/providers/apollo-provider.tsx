'use client';

import React, { ReactNode } from 'react';
import { HttpLink } from '@apollo/client';
import {
  NextSSRInMemoryCache,
  NextSSRApolloClient,
  ApolloNextAppProvider,
  SSRMultipartLink
} from "@apollo/experimental-nextjs-app-support/ssr";
import { DEFAULT_GRAPHQL_URI } from '@/lib/apollo-client';

const graphqlUri = process.env.NEXT_PUBLIC_GRAPHQL_PROXY_URL || DEFAULT_GRAPHQL_URI;

const httpLink = new HttpLink({
  uri: graphqlUri,
  credentials: 'include',
});

function makeClient() {
  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(),
    link:
      typeof window === 'undefined'
        ? new SSRMultipartLink({
            stripDefer: true,
            cutoffDelay: 5000,
          }).concat(httpLink)
        : httpLink,
  });
}

export function ApolloWrapper({ children }: { children: ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
