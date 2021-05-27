import {DIMENSIONS, DRAW, WINNING_COMBOS} from '-/constants';

export const checkForWinner = grid => {
    let res = null;

    WINNING_COMBOS.forEach((el, i) => {
        const firstEl = grid[el[0]];

        if (firstEl && (firstEl === grid[el[1]] && firstEl === grid[el[2]])) {
            res = {
                winner: firstEl,
                winningIndex: i
            };
        } else if (res === null && getEmptySquares(grid).length === 0) {
            res = {
                winner: DRAW,
                winningIndex: null
            };
        }
    });

    return res;
};

export const fillBoard = () => {
    return new Array(DIMENSIONS ** 2).fill(null);
};

export const getEmptySquares = (grid = []) => {
    return grid.reduce((arr, value, i) => {
        if (!value) {
            arr.push(i);
        }

        return arr;
    }, []);
};

export const getStrikethroughStyles = winningIndex => {
    const defaultWidth = 285;
    const diagonalWidth = 400;

    switch (winningIndex) {
        case 0:
            return `
            transform: none;
            top: 41px;
            left: 15px;
            width: ${defaultWidth}px;`;
        case 1:
            return `
            transform: none;
            top: 140px;
            left: 15px;
            width: ${defaultWidth}px;`;
        case 2:
            return `
            transform: none;
            top: 242px;
            left: 15px;
            width: ${defaultWidth}px;`;
        case 3:
            return `
            transform: rotate(90deg);
            top: 145px;
            left: -86px;
            width: ${defaultWidth}px;`;
        case 4:
            return `
            transform: rotate(90deg);
            top: 145px;
            left: 15px;
            width: ${defaultWidth}px;`;
        case 5:
            return `
            transform: rotate(90deg);
            top: 145px;
            left: 115px;
            width: ${defaultWidth}px;`;
        case 6:
            return `
            transform: rotate(45deg);
            top: 145px;
            left: -44px;
            width: ${diagonalWidth}px;`;
        case 7:
            return `
            transform: rotate(-45deg);
            top: 145px;
            left: -46px;
            width: ${diagonalWidth}px;`;
        default:
            return null;
    }
};

export const sleep = delay => {
    return new Promise(res => {
        return setTimeout(res, delay);
    });
};
