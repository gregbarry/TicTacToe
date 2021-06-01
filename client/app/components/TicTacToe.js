import {get} from 'lodash';
import confetti from 'canvas-confetti';
import React, {Component} from 'react';
import styled from 'styled-components';
import socketClient from 'socket.io-client';
import Modal from 'react-bootstrap/Modal';
import Loader from 'react-loader-spinner';
import Carousel from 'react-bootstrap/Carousel';

import {DIMENSIONS, DRAW, SQUARE_DIMENSIONS} from '-/constants';
import {getStrikethroughStyles, sleep} from '-/utils';

const Strikethrough = styled.div`
    position: absolute;
    ${({styles}) => styles}
    background-color: red;
    height: 5px;
    width: ${({styles}) => !styles && 0};
`;

const StyledGrid = styled.div`
    display: flex;
    justify-content: center;
    width: ${({dimensions}) => `${dimensions * (SQUARE_DIMENSIONS + 5)}px`};
    flex-flow: wrap;
    position: relative;
`;

const StyledMark = styled.p`
    font-size: 68px;
`;

const StyledSquare = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${SQUARE_DIMENSIONS}px;
    height: ${SQUARE_DIMENSIONS}px;
    border: 1px solid black;

    &:hover {
        cursor: pointer;
    }
`;

const Facts = () => {
    const tips = [
        'An early variation of tic-tac-toe was played in the Roman Empire, around the first century BC.',
        'There are 255,168 possible tic-tac-toe move variations.',
        'Historians believe the name at the time, tit-tat-toe, came from the sound of the pencil hitting the board.',
        'The first print reference of tic-tac-toe appeared in Britain in 1864. It was called "Noughts and Crosses".'
    ];

    return (
        <Carousel indicators={false} interval={10000} controls={false}>
            {tips.map(tip => {
                return (
                    <Carousel.Item key={tip}>
                        <p>{tip}</p>
                    </Carousel.Item>
                );
            })}
        </Carousel>
    );
};
export default class TicTacToe extends Component {
    constructor(props) {
        super(props);

        this.state = {
            connected: false,
            grid: undefined,
            message: undefined,
            players: [],
            roomId: undefined,
            waiting: true,
            winner: null,
            winningIndex: null
        };
    }

    getCurrentPlayer = () => {
        const {players = []} = this.state;
        const email = get(this, 'props.user.email');
        const player = players.find(player => player.name === email) || {};

        return player;
    };

    isCurrentPlayerActive = () => {
        const player = this.getCurrentPlayer();
        const {active} = player;

        return active;
    };

    getMessage = (roomObj = {}) => {
        const {players = [], winner} = roomObj;
        const email = get(this, 'props.user.email');
        const player = players.find(player => player.name === email) || {};
        const {active, piece} = player;
        const otherPlayer = players.find(player => player.name !== email) || {};
        const {name, piece: otherPlayerPiece} = otherPlayer;
        let message = active ? 'Your Turn' : `Waiting on ${name}`;

        if (winner) {
            switch(winner) {
                case DRAW: {
                    message = 'It was a draw';
                    break;
                }
                case piece: {
                    message = 'You Won!';
                    break;
                }
                case otherPlayerPiece: {
                    message = `${name} won :(`;
                    break;
                }
            }
        }

        return message;
    };

    async componentDidMount() {
        const {gameType, startOver, user} = this.props;
        const {email, id} = user;

        this.socket = socketClient();
        this.socket.emit('startGame', {
            gameType,
            email,
            id
        });

        this.socket.on('gameOver', async() => {
            await sleep(4000);
            startOver();
        });

        this.socket.on('joiningRoom', roomObj => {
            const {grid, players, roomId} = roomObj;
            const message = this.getMessage(roomObj);
            const tableFull = players.length === 2;

            this.setState({
                connected: true,
                grid,
                message,
                players,
                roomId,
                waiting: !tableFull
            });
        });

        this.socket.on('moveHandled', roomObj => {
            const message = this.getMessage(roomObj);

            this.setState({
                ...roomObj,
                message
            });
        });
    }

    componentWillUnmount() {
        this.socket.disconnect();
    }

    handleMove = e => {
        const {user} = this.props;
        const {email} = user;
        const index = get(e, 'target.dataset.square');
        const {grid = [], players = [], roomId} = this.state;
        const player = players.find(player => player.name === email);
        const {active} = player;

        if (!grid[index] && active) {
            this.socket.emit('move', {player, roomId, square: Number(index)});
        }
    };

    render() {
        const {
            connected,
            grid = [],
            message = '',
            waiting,
            winner,
            winningIndex
        } = this.state;

        if (!connected) {
            return null;
        }

        const {gameType} = this.props;
        const gameOver = winner !== null;
        const strikeStyle = getStrikethroughStyles(winningIndex);
        const currentPlayer = this.getCurrentPlayer();
        const {active, piece} = currentPlayer;
        const canPlay = !gameOver && active;

        if (winner === piece) {
            confetti({particleCount: 100, spread: 70, origin: {y: 0.6}});
        }

        return (
            <>
                <h2 className="mb-3">{message}</h2>
                <StyledGrid
                    className="mx-auto"
                    dimensions={DIMENSIONS}>
                    {grid.map((mark, i) => {
                        const isActive = mark !== null;

                        return (
                            <StyledSquare
                                key={`${mark}-${i}`}
                                data-square={i}
                                onClick={canPlay ? this.handleMove : null}>
                                {isActive && (
                                    <StyledMark>
                                        {mark}
                                    </StyledMark>
                                )}
                            </StyledSquare>
                        );
                    })}
                    <Strikethrough styles={strikeStyle} />
                </StyledGrid>
                <Modal
                    className="text-center"
                    onHide={() => {}}
                    animation={false}
                    size="lg"
                    show={waiting && gameType === 'multiplayer'}>
                    <Modal.Body>
                        <h2>Waiting for Opponent</h2>
                        <Loader
                            className="text-center my-3"
                            color="#007bff"
                            type="Rings"
                            height="250" />
                        <Facts />
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}
