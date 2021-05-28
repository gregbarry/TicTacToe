import 'react-toastify/dist/ReactToastify.css';

import {capitalize, get, isEmpty} from 'lodash';
import React, {Component} from 'react';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import TicTacToe from '-/components/TicTacToe';
import LoginForm from '-/components/LoginForm';
import {getCurrentUser, logout} from '-/utils/auth';

const StyledRoot = styled.div``;

class App extends Component{
    constructor(props) {
        super(props);

        const currentUser = getCurrentUser();
        const {user = {}} = currentUser;

        this.state = {
            formType: 'login', // Can be 'login' or 'signup'
            gameType: undefined, // Can be 'multiplayer' or 'computer'
            loggedIn: !isEmpty(user),
            user
        };
    }

    toggleFormType = e => {
        e.preventDefault();
        const {formType} = this.state;

        this.setState({
            formType: formType === 'login' ? 'signup' : 'login'
        });
    };

    handleLogout = e => {
        e.preventDefault();
        logout();
    };

    handleSelectGameType = e => {
        const gameType = get(e, 'target.dataset.gametype');
        this.setState({gameType});
    };

    handleStartOver = () => {
        this.setState({gameType: undefined});
    };

    handleSetUserData = user => {
        this.setState({
            loggedIn: true,
            user
        });
    };

    render() {
        const {formType, gameType, loggedIn, user = {}} = this.state;
        const {email} = user;
        const formTypeLink = formType == 'signup' ? 'I already have an account' : 'I don\'t have a login';
        let step;

        if (!gameType && !loggedIn) {
            step = 'login';
        } else if (!gameType && loggedIn) {
            step = 'selectGame';
        } else if (loggedIn && gameType) {
            step = 'goTime';
        }

        return (
            <Container className="text-center">
                <StyledRoot className="mt-5">
                    <Row>
                        <Col>
                            <h2>Tic Tac Toe</h2>
                            {step === 'login' && (
                                <>
                                    <p>
                                        Hello! Welcome to my Tic Tack Toe game. Please
                                        Login or Signup to play some Tic-Tac-Toe.
                                    </p>
                                    <p><i>
                                        <a
                                            href="#"
                                            onClick={this.toggleFormType}>
                                            &nbsp;{formTypeLink}
                                        </a>
                                    </i></p>
                                    <LoginForm
                                        onSetUserData={this.handleSetUserData}
                                        formType={formType} />
                                </>
                            )}
                            {step === 'selectGame' && (
                                <>
                                    <p>
                                        Would you like to play against another player,
                                        or against this program?
                                    </p>
                                    {['multiplayer', 'computer'].map(type => {
                                        return (
                                            <Button
                                                key={type}
                                                className="mr-3"
                                                data-gametype={type}
                                                size="lg"
                                                onClick={this.handleSelectGameType}>
                                                Play {capitalize(type)}
                                            </Button>
                                        );
                                    })}
                                </>
                            )}
                            {step === 'goTime' && (
                                <>
                                    <TicTacToe
                                        gameType={gameType}
                                        user={user} />
                                    <Button
                                        className="mt-4"
                                        size="lg"
                                        onClick={this.handleStartOver}>
                                        Start Over
                                    </Button>
                                </>
                            )}
                            {loggedIn && (
                                <div className="my-5">
                                    <p>
                                        Logged in as {email}
                                        &nbsp;(<a href="#" onClick={this.handleLogout}>Logout</a>)
                                    </p>
                                </div>
                            )}
                        </Col>
                    </Row>
                </StyledRoot>
            </Container>
        );
    }
}

export default App;