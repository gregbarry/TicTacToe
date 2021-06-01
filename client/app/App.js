import 'react-toastify/dist/ReactToastify.css';

import {withApollo} from '@apollo/client/react/hoc';
import {capitalize, get, isEmpty} from 'lodash';
import React, {Component} from 'react';
import styled from 'styled-components';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

import TicTacToe from '-/components/TicTacToe';
import LoginForm from '-/components/LoginForm';
import {getCurrentUser, logout} from '-/utils/auth';
import icon from '-/assets/tic-tac-toe.svg';
import {getGameResults, getLeaderBoard} from '-/graphql/user';

const StyledRoot = styled.div`
    font-family: 'Heebo', sans-serif
`;

class App extends Component{
    constructor(props) {
        super(props);

        const currentUser = getCurrentUser();
        const {user = {}} = currentUser;

        this.state = {
            formType: 'login', // Can be 'login' or 'signup'
            gameHistory: [],
            gameType: undefined, // Can be 'multiplayer' or 'computer'
            leaderBoard: [],
            loggedIn: !isEmpty(user),
            user
        };
    }

    async componentDidMount() {
        const {client} = this.props;
        const leaderRes = await client.query({query: getLeaderBoard});
        const leaderBoard = get(leaderRes, 'data.getLeaderBoard', []);
        const gameRes = await client.query({query: getGameResults});
        const gameHistory = get(gameRes, 'data.getGameResults', []);

        console.log('gameHistory', gameHistory);

        this.setState({
            gameHistory,
            leaderBoard
        });
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
        const {
            formType,
            gameHistory = [],
            gameType,
            leaderBoard = [],
            loggedIn,
            user = {}
        } = this.state;
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
                        <Col md={{span: 10, offset: 1}}>
                            <img src={icon} width={125} className="mb-4" />
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
                                                className="mr-3 my-2"
                                                data-gametype={type}
                                                size="lg"
                                                onClick={this.handleSelectGameType}>
                                                {capitalize(type)}
                                            </Button>
                                        );
                                    })}
                                </>
                            )}
                            {step === 'goTime' && (
                                <>
                                    <TicTacToe
                                        gameType={gameType}
                                        startOver={this.handleStartOver}
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
                                <div className="my-4">
                                    <p>
                                        Logged in as {email}
                                        &nbsp;(<a href="#" onClick={this.handleLogout}>Logout</a>)
                                    </p>
                                </div>
                            )}
                        </Col>
                    </Row>
                    <Row>
                        <Col md={{span: 10, offset: 1}}>
                            <Accordion>
                                <Card>
                                    <Card.Header>
                                        <Accordion.Toggle as={Button} variant="link" eventKey="0">
                                            Leader Board
                                        </Accordion.Toggle>
                                    </Card.Header>
                                    <Accordion.Collapse eventKey="0">
                                        <Card.Body className="p-0">
                                            <Table striped bordered size="sm" className="mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Player</th>
                                                        <th>Wins</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {leaderBoard.map((leader, i) => {
                                                        const {email, counted} = leader;

                                                        return (
                                                            <tr key={email}>
                                                                <td>{i+1}</td>
                                                                <td>{email}</td>
                                                                <td>{counted}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>
                                        </Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                                <Card>
                                    <Card.Header>
                                        <Accordion.Toggle as={Button} variant="link" eventKey="1">
                                            Game History
                                        </Accordion.Toggle>
                                    </Card.Header>
                                    <Accordion.Collapse eventKey="1">
                                        <Card.Body className="p-0">
                                            <Table striped bordered size="sm" className="mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Winner</th>
                                                        <th>Loser</th>
                                                        <th>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {gameHistory.map((game, i) => {
                                                        const {loser, timestamp, winner} = game;

                                                        return (
                                                            <tr key={`${winner}-${i}`}>
                                                                <td>{winner}</td>
                                                                <td>{loser}</td>
                                                                <td>{timestamp}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>
                                        </Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                            </Accordion>
                        </Col>
                    </Row>
                </StyledRoot>
            </Container>
        );
    }
}

export default withApollo(App);