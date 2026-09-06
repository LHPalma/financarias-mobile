import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const graphqlUrl = process.env.EXPO_PUBLIC_GRAPHQL_URL;

if (!graphqlUrl) {
	throw new Error("EXPO_PUBLIC_GRAPHQL_URL não configurada (veja .env.local)");
}

export const apolloClient = new ApolloClient({
	link: new HttpLink({ uri: graphqlUrl }),
	cache: new InMemoryCache(),
});
