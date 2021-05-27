import {Pool} from 'pg';
import bcrypt from 'bcrypt';
import logger from 'bristol';
import {gql} from 'apollo-server-express';
import jwt from 'jsonwebtoken';

const {
    JWT_TOKEN_SECRET,
    PG_USER,
    PG_HOST,
    PG_DATABASE,
    PG_PASSWORD,
    PG_PORT
} = process.env;

const db = new Pool({
    user: PG_USER,
    host: PG_HOST,
    database: PG_DATABASE,
    password: PG_PASSWORD,
    port: PG_PORT
});

const userLogin = async(root, params) => {
    const {user = {}} = params;
    const {email, password: textPassword} = user;
    let rows;

    try {
        const query = `SELECT id, email, password FROM users WHERE email = '${email}'`;
        ({rows = []} = await db.query(query));
    } catch(ex) {
        logger.error(ex);
    }

    if (!rows.length) {
        const message = `No user found with email: ${email}`;

        return {
            __typename: 'Error',
            code: 401,
            message
        };
    }

    const [userRow = {}] = rows;
    const {id, password: userPassword, email: userEmail} = userRow;
    const validPassword = await bcrypt.compare(textPassword, userPassword);

    if (!validPassword) {
        const message = `Incorrect password for user ${email}`;

        return {
            __typename: 'Error',
            code: 403,
            message
        };
    }

    const token = jwt.sign({email, id}, JWT_TOKEN_SECRET);

    return {
        __typename: 'UserLogin',
        user: {
            email: userEmail
        },
        token
    };
};

const userSignup = async(root, params) => {
    const {user = {}} = params;
    const {email, password: textPassword} = user;
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(textPassword, salt);
    let rows;

    try {
        const {rows: existsRows = []} = await db.query(`SELECT email FROM users WHERE email = '${email}'`);

        if (existsRows.length) {
            const message = `An account for ${email} already exists`;

            return {
                __typename: 'Error',
                code: 409,
                message
            };
        }

        const query = `INSERT INTO users (email, password) VALUES ('${email}', '${password}') RETURNING id`;
        ({rows = []} = await db.query(query));
    } catch(ex) {
        logger.error(ex);
    }

    const [userRow = {}] = rows;
    const {id} = userRow;
    const token = jwt.sign({email, id}, JWT_TOKEN_SECRET);

    return {
        __typename: 'UserLogin',
        user: {
            email
        },
        token
    };
};

export const typeDefs = gql`
    type Error {
        code: Int
        message: String
    }

    type User {
        email: String
        password: String
    }

    type UserLogin {
        user: User
        token: String
    }

    input UserInput {
        email: String!
        password: String!
    }

    union UserLoginResult = UserLogin | Error

    extend type Query {
        userLogin(user: UserInput): UserLoginResult
    }

    extend type Mutation {
        userSignup(user: UserInput): UserLoginResult
    }
`;

export const resolvers = {
    Mutation: {
        userSignup
    },
    Query: {
        userLogin
    }
};
