# apollo-link-prime

Apollo Link provider for Prime

## Installation
`yarn add -S apollo-link-prime`

or

`npm install -S apollo-link-prime`

## Usage

```js
import { PrimeLink } from 'apollo-link-prime';

const apolloClient = new ApolloClient({
  link: PrimeLink({
    uri: 'https://prime.example.com/graphql',
    accessToken: '...',
  }),
  cache: new InMemoryCache()
});
```

