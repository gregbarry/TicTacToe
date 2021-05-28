
export const checkForWinner = grid => {
    let res = null;

    winningCombos.forEach((el, i) => {
        const firstEl = grid[el[0]];

        if (firstEl && (firstEl === grid[el[1]] && firstEl === grid[el[2]])) {
            res = {
                winner: firstEl,
                winningIndex: i
            };
        } else if (res === null && getEmptySquares(grid).length === 0) {
            res = {
                winner: 0,
                winningIndex: null
            };
        }
    });

    return res;
};

export const getEmptySquares = (grid = []) => {
    return grid.reduce((arr, value, i) => {
        if (!value) {
            arr.push(i);
        }

        return arr;
    }, []);
};

export const sleep = delay => {
    return new Promise(res => {
        return setTimeout(res, delay);
    });
};

export const updatePlayers = (players = []) => {
    return players.map(player => {
        const {active, ...theRest} = player;

        return {
            active: !active,
            ...theRest
        };
    });
};

const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];