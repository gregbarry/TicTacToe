import {get, sample} from 'lodash';
import confetti from 'canvas-confetti';
import React, {Component} from 'react';
import styled from 'styled-components';
import socketClient from 'socket.io-client';

import {
    DIMENSIONS,
    DRAW,
    PLAYER_X,
    PLAYER_O,
    SQUARE_DIMENSIONS
} from '-/constants';
import {checkForWinner, fillBoard, getEmptySquares, getStrikethroughStyles, sleep} from '-/utils';

const Strikethrough = styled.div`
    position: absolute;
    ${({styles}) => {
        return styles;
    }}
    background-color: red;
    height: 5px;
    width: ${({styles}) => {
        return !styles && 0;
    }};
`;

const StyledGrid = styled.div`
    display: flex;
    justify-content: center;
    width: ${({dimensions}) => {
        return `${dimensions * (SQUARE_DIMENSIONS + 5)}px`;
    }};
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

export default class TicTacToe extends Component {
    constructor(props) {
        super(props);

        const {gameType} = props;

        this.state = {
            grid: fillBoard(),
            message: 'Your Turn',
            players: {
                computer: PLAYER_O,
                human: PLAYER_X
            },
            ...gameType === 'multiplayer' && {
                room: undefined
            },
            turn: 'player1',
            winner: null,
            winningIndex: null
        };
    }

    async componentDidMount() {
        const {gameType} = this.props;

        if (gameType === 'multiplayer') {
            this.socket = socketClient();
            this.socket.emit('newGame');
            this.socket.on('newGameCreated', room => {
                this.setState({
                    serverConfirmed: true,
                    room
                });
            });
        }
    }

    componentWillUnmount() {
        const {gameType} = this.state;

        if (gameType === 'multiplayer') {
            this.socket.disconnect();
        }
    }

    move = (index, player, cb) => {
        const {grid = [], turn} = this.state;
        const yourTurn = turn === 'player2';
        const gridClone = [...grid];
        gridClone[index] = player;
        let winner = null;
        let winningIndex = null;
        let message;

        const winnerObj = checkForWinner(gridClone);

        if (winnerObj) {
            ({winner, winningIndex} = winnerObj);
        }

        const gameOver = winner !== null;

        switch(winner) {
            case DRAW: {
                message = 'It was a draw';
                break;
            }
            case 1: {
                message = 'You Won!';
                break;
            }
            case 2: {
                message = 'The other player won :(';
                break;
            }
            default: {
                message = yourTurn ? 'Your Turn' : 'Waiting on Other Player';
            }
        }

        this.setState({
            grid: gridClone,
            message,
            winner,
            winningIndex,
            ...!gameOver && {
                turn: yourTurn ? 'player1' : 'player2'
            }
        }, () => {
            if (cb && !gameOver) {
                cb();
            }
        });
    };

    handleComputerMove = async() => {
        const {grid = [], players = {}} = this.state;
        const {computer} = players;
        const emptySquares = getEmptySquares(grid);
        // TODO: Investiage minimax to make computer picks smarter
        const computerPick = sample(emptySquares);

        // Add a slight pause before computer plays so it's less jarring
        await sleep(1250);

        if (!grid[computerPick]) {
            this.move(computerPick, computer);
        }
    };

    handleHumanMove = e => {
        const index = get(e, 'target.dataset.square');
        const {grid = [], players = {}, turn} = this.state;
        const {human} = players;

        if (!grid[index] && turn === 'player1') {
            this.move(index, human, this.handleComputerMove);
        }
    };

    render() {
        const {grid = [], message = '', winner, winningIndex} = this.state;
        const gameOver = winner !== null;
        const strikeStyle = getStrikethroughStyles(winningIndex);

        if (winner === 1) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: {y: 0.6}
            });
        }

        return (
            <>
                <h2 className="mb-3">{message}</h2>
                <StyledGrid
                    className="mx-auto"
                    dimensions={DIMENSIONS}>
                    {grid.map((value, i) => {
                        const isActive = value !== null;
                        const mark = value === PLAYER_X ? 'X' : 'O';

                        return (
                            <StyledSquare
                                key={`${value}-${i}`}
                                data-square={i}
                                onClick={!gameOver ? this.handleHumanMove : null}>
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
            </>
        );
    }
}
