import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { toast } from '@/hooks/use-toast';

export const DEFAULT_GRAPHQL_URI = '/api/graphql';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      toast({
        title: 'Có lỗi xảy ra',
        description: 'Không thể thực hiện thao tác. Vui lòng thử lại.',
        variant: 'destructive',
      });
    });
  }

  if (networkError) {
    toast({
      title: 'Lỗi kết nối',
      description: 'Không thể kết nối tới hệ thống. Vui lòng kiểm tra lại đường truyền mạng và thử lại.',
      variant: 'destructive',
    });
  }
});

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_PROXY_URL || DEFAULT_GRAPHQL_URI,
  fetchOptions: {
    credentials: 'include',
  },
});

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            merge(existing, incoming) {
              return incoming;
            }
          },
          cart: {
            merge(existing, incoming) {
              return incoming;
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    },
    mutate: {
      errorPolicy: 'all'
    }
  }
});
