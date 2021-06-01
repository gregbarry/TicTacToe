import {gql} from '@apollo/client';

const userFragment = gql`
    fragment User on User {
        email
        id
    }
`;

export const userLogin = gql`
    query userLogin($user: UserInput) {
        userLogin(user: $user) {
            __typename
            ... on UserLogin {
                user {
                    ...User
                }
                token
            }
            ... on Error {
                code
                message
            }
        }
    }
    ${userFragment}
`;

export const userSignup = gql`
    mutation userSignup($user: UserInput) {
        userSignup(user: $user) {
            __typename
            ... on UserLogin {
                user {
                    ...User
                }
                token
            }
            ... on Error {
                code
                message
            }
        }
    }
    ${userFragment}
`;

export const getGameResults = gql`
    query getGameResults {
        getGameResults {
            winner
            loser
            timestamp
        }
    }
`;

export const getLeaderBoard = gql`
    query getLeaderBoard {
        getLeaderBoard {
            counted
            email
        }
    }
`;
