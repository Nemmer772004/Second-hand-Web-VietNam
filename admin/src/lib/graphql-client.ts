const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4000';
const GRAPHQL_URL = baseUrl.endsWith('/graphql') ? baseUrl : `${baseUrl}/graphql`;

type Variables = Record<string, unknown> | undefined;

export async function graphqlRequest<T = any>(query: string, variables: Variables = undefined, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('admin_token');
    if (stored) {
      headers.Authorization = `Bearer ${stored}`;
    }
  }

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  const json = await response.json();
  if (!response.ok || json.errors) {
    const errorMessage = json.errors?.[0]?.message || response.statusText || 'GraphQL request failed';
    throw new Error(errorMessage);
  }
  return json.data;
}
