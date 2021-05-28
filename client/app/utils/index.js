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
