# apollo-link-prime

Apollo Link provider for Prime

## Installation
`yarn add -S apollo-link-prime`

or

`npm install -S apollo-link-prime`

## Usage

```ts
import { PrimeLink } from 'apollo-link-prime';

const apolloClient = new ApolloClient({
  link: PrimeLink({
    url: 'https://prime.example.com',
    accessToken?: '',
    ssrMode?: false,
    linkResolver?: (document, schema) => '/',
    cookies?: { [key: string]: string },
  }),
  cache: new InMemoryCache()
});
```

| parameter | type | default | description |
| --------- | ---- | ------- | ----------- |
| **url** | string | required | Absolute URL with no path at the end to a Prime endpoint |
| **accessToken** | string | undefined | Permanent server token or JWT access token (private api enabled) |
| **ssrMode** | boolean | false | If enabled, client will store a preview cookie and reload the page. |
| **linkResolver** | Function | undefined | This function can return a redirect path for the previewed document in question |
| **cookies** | object | undefined | Pass cookies from express etc. in object format. The link will read stored preview cookie from _ssrMode_ |

### Client

You read preview state and clear it with the following utility functions.

```js
import { clearPreview, isPreviewing } from 'apollo-link-prime';

// client code

if (isPreviewing()) {
  button.onclick = () => clearPreview();
}
```
