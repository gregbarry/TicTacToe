import {get} from 'lodash';
import {ApolloClient, ApolloProvider, InMemoryCache} from '@apollo/client';
import React, {StrictMode} from 'react';
import ReactDOM from 'react-dom';

import App from '-/App';

const cache = new InMemoryCache();
const localDomains = ['localhost', '127.0.0.1', ''];
const {hostname} = get(window, 'location');
const uri = localDomains.includes(hostname) ? 'http://localhost:4000/graphql' : '/graphql';
const client = new ApolloClient({
    credentials: 'include',
    uri,
    cache
});

ReactDOM.render(
    <ApolloProvider client={client}>
        <StrictMode>
            <App />
        </StrictMode>
    </ApolloProvider>,
    document.getElementById('root')
);
