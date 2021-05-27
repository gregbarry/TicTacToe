import {gql} from 'apollo-server-express';

export const typeDefs = gql`
    type Query {
        _empty: String
    }

    type Mutation {
        _empty: String
    }
`;

export const resolvers = {};
