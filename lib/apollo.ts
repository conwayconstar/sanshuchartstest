import { IncomingMessage, ServerResponse } from 'http'
import { useMemo } from 'react'
import {
  ApolloClient, HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
    split
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined

export type ResolverContext = {
  req?: IncomingMessage
  res?: ServerResponse
}

const subgraph = 'id/QmWJ8ffrWB82zyjfhstAmPLAc1bH1UwvbkgnNHCSJcxVwn';
// const subgraph = 'name/sanshuinudev/dex-candles';

function createIsomorphLink(_: ResolverContext = {}) {
    const httpLink =  new HttpLink({
      uri: `https://api.thegraph.com/subgraphs/id/QmWJ8ffrWB82zyjfhstAmPLAc1bH1UwvbkgnNHCSJcxVwn`,
      credentials: 'same-origin',
    });
    if(typeof window === 'undefined') return httpLink

  const wsLink = new WebSocketLink({
    uri: `wss://api.thegraph.com/subgraphs/id/QmWJ8ffrWB82zyjfhstAmPLAc1bH1UwvbkgnNHCSJcxVwn`,
    options: {
      reconnect: true
    }
  });

    return split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
              definition.kind === 'OperationDefinition' &&
              definition.operation === 'subscription'
          );
        },
        wsLink,
        httpLink,
    )
}

function createApolloClient(context?: ResolverContext) {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: createIsomorphLink(context),
    cache: new InMemoryCache(),
  })
}

export function initializeApollo(
  initialState: any = null,
  // Pages with Next.js data fetching methods, like `getStaticProps`, can send
  // a custom context which will be used by `SchemaLink` to server render pages
  context?: ResolverContext
) {
  const _apolloClient = apolloClient ?? createApolloClient(context)

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState)
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

export function useApollo(initialState: any) {
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}
