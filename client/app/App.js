import 'react-toastify/dist/ReactToastify.css';

import {get} from 'lodash';
import React, {Component} from 'react';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import socketClient from 'socket.io-client';

import TicTacToe from '-/components/TicTacToe';

const StyledRoot = styled.div``;

let socket;

class App extends Component{
    constructor(props) {
        super(props);

        this.state = {
            data: undefined,
            initialStep: true,
            gameType: undefined
        };
    }

    componentWillUnmount() {
        const {gameType} = this.state;

        if (gameType === 'multi') {
            socket.disconnect();
        }
    }

    handleSelectGameType = e => {
        const gameType = get(e, 'target.dataset.gametype');

        if (gameType === 'multi') {
            socket = socketClient();

            socket.on('FromAPI', data => {
                this.setState({
                    data
                });
            });
        }

        this.setState({
            gameType,
            initialStep: false
        });
    };

    handleStartOver = () => {
        this.setState({
            initialStep: true
        });
    }

    render() {
        console.log(this.state);
        const {initialStep} = this.state;

        return (
            <Container className="text-center">
                <StyledRoot className="mt-5">
                    <Row>
                        <Col>
                            {initialStep ? (
                                <>
                                    <h2>Tic Tac Toe</h2>
                                    <p>
                                        Hello!  Welcome to my Tic Tack Toe game.  Would you like
                                        to play against another player, or against this program?
                                    </p>
                                    <Button
                                        className="mr-3"
                                        data-gametype="multi"
                                        size="lg"
                                        onClick={this.handleSelectGameType}>
                                        Person
                                    </Button>
                                    <Button
                                        data-gametype="single"
                                        size="lg"
                                        onClick={this.handleSelectGameType}>
                                        Computer
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <TicTacToe />
                                    <Button
                                        className="mt-4"
                                        data-gametype="single"
                                        size="lg"
                                        onClick={this.handleStartOver}>
                                        Start Over
                                    </Button>
                                </>
                            )}
                        </Col>
                    </Row>
                </StyledRoot>
            </Container>
        );
    }
}

export default App;