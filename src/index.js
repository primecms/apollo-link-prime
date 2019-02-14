import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';

const browser = typeof window !== 'undefined';
const storage = new Map();

const localStorage = browser ? window.localStorage : {
  getItem(key) { return storage.get(key); },
  setItem(key, value) { return storage.set(key, value); },
  removeItem(key) { return storage.delete(key); }
};

const getQuery = () => {
  if (browser) {
    return window.location.search
      .substr(1)
      .split('&')
      .reduce((acc, item) => {
        const [key, value] = item.split('=').map(decodeURIComponent);
        acc[key] = value;
        return acc;
      }, {});
  }
  return {};
}

export function isPreviewing() {
  return getQuery()['prime.id'] || !!localStorage.getItem('prime.preview');
}

export function clearPreview() {
  if (browser) {
    localStorage.removeItem('prime.refreshToken');
    localStorage.removeItem('prime.accessToken');
    localStorage.removeItem('prime.preview');

    document.cookie = 'prime.refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'prime.accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'prime.preview=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    window.location.reload();
  }
}


export function PrimeLink({ url, accessToken, linkResolver, cookies = {}, ssrMode = false }) {
  const primeLink = setContext(
    async (request, options) => {

      const extra = {
        ...accessToken ? { 'x-prime-token': accessToken } : {},
      };

      const query = getQuery();
      
      // client handling
      if (browser) {
        if (query['prime.id']) {
          const previewUrl = `${url}/prime/preview?id=${query['prime.id']}`;
          const res = await fetch(previewUrl, { credentials: 'include' }).then(r => r.json());

          document.cookie = 'prime.refreshToken=' + res.refreshToken;
          document.cookie = 'prime.accessToken=' + res.accessToken;
          document.cookie = 'prime.preview=' + query['prime.id'];

          localStorage.setItem('prime.refreshToken', res.refreshToken);
          localStorage.setItem('prime.accessToken', res.accessToken);
          localStorage.setItem('prime.preview', query['prime.id']);

          extra['x-prime-token'] = res.accessToken;
          extra['x-prime-preview'] = query['prime.id'];

          if (ssrMode) {
            if (typeof linkResolver === 'function') {
              window.location = linkResolver(res.document, res.schema);
              return;
            }
            window.location = '/';
          }
        }
      
        if (localStorage.getItem('prime.accessToken')) {
          extra['x-prime-token'] = localStorage.getItem('prime.accessToken');
        }

        if (localStorage.getItem('prime.preview')) {
          extra['x-prime-preview'] = localStorage.getItem('prime.preview');
        }
      }

      // server side handling of cookies

      if (cookies && cookies['prime.accessToken']) {
        extra['x-prime-token'] = cookies['prime.accessToken'];
      }

      if (cookies && cookies['prime.preview']) {  
        extra['x-prime-preview'] = cookies['prime.preview'];
      }

      return {
        headers: {
          ...options.headers,
          ...extra,
        }
      };
    }
  );

  const httpLink = new HttpLink({
    uri: `${url}/graphql`,
    useGETForQueries: true,
  });

  return primeLink.concat(httpLink);
}
