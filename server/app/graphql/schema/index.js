import {makeExecutableSchema} from 'apollo-server-express';

const schemas = [
    './base',
    './user'
];

const typeDefs = schemas.reduce((typeDefCollection, key) => {
    const result = require(key);
    const {typeDefs} = result;

    typeDefCollection.push(typeDefs);

    return typeDefCollection;
}, []);

const resolvers = schemas.reduce((resolversCollection, key) => {
    const result = require(key);
    const {resolvers} = result;

    resolversCollection.push(resolvers);

    return resolversCollection;
}, []);


export default makeExecutableSchema({
    typeDefs,
    resolvers
});