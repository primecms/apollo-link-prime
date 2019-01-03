import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';

export function PrimeLink({ uri, accessToken, ...args }) {
  const primeLink = setContext(
    (request, options) => {
      const authorizationHeader = accessToken ? { Authorization: `Token ${accessToken}` } : {};
      return {
        headers: {
          ...options.headers,
          ...authorizationHeader,
          'x-prime-version-id': null,
        }
      };
    }
  );

  const httpLink = new HttpLink({
    uri,
    useGETForQueries: true,
    ...args,
  });

  return primeLink.concat(httpLink);
}
