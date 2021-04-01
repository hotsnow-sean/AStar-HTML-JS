const mousepos_span = document.getElementById('mousepos');
const fps_span = document.getElementById('fps');
const result_span = document.getElementById('result');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const COLOR = { BEGIN: 'red', END: 'blue', WALL: '#333233', CLOSED: 'lightseagreen', WAIT: 'green' }
const NODE = { BEGIN: -1, END: 1, WALL: 2, ROAD: 0 }
const ROWS = 21, COLS = 31;

const grid = new GridController(canvas, ROWS, COLS, 20);
let beginPoint;
let endPoint;
let map;

let isBeginMove = false;
let isEndMove = false;
let isDrawWall = false;
let currentPos = { row: 0, col: 0 }
let createState = true; // true is not create or have created

function start() {
    // initicial
    initicial();

    canvas.style.background = '#BFBDBF';
    grid.closeLineShow();
    // grid.drawBackLine();
    grid.fillGrid(beginPoint.row, beginPoint.col, COLOR.BEGIN);
    grid.fillGrid(endPoint.row, endPoint.col, COLOR.END);
}

start();

function initicial() {
    beginPoint = { row: 2, col: 2 };
    endPoint = { row: ROWS - 3, col: COLS - 3 };
    map = new Array(ROWS).fill(0).map(() => new Array(COLS).fill(NODE.ROAD));
    map[beginPoint.row][beginPoint.col] = NODE.BEGIN;
    map[endPoint.row][endPoint.col] = NODE.END;
    fps_span.innerHTML = grid.getFps();
}
function reInit() {
    result_span.innerHTML = "Don't start search!";
    initicial();
    AStarRecover();
    grid.clearAll();
    grid.drawBackLine();
    grid.fillGrid(beginPoint.row, beginPoint.col, COLOR.BEGIN);
    grid.fillGrid(endPoint.row, endPoint.col, COLOR.END);
    grid.closeLoop();
}
function clearSearch() {
    if (!isFinding) return;
    result_span.innerHTML = "Don't start search!";
    grid.closeLoop();
    if (isFinding) {
        grid.clearAll();
        grid.drawBackLine();
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                switch (map[i][j]) {
                    case NODE.WALL: grid.fillGrid(i, j, COLOR.WALL); break;
                    case NODE.BEGIN: grid.fillGrid(i, j, COLOR.BEGIN); break;
                    case NODE.END: grid.fillGrid(i, j, COLOR.END); break;
                }
            }
        }
    }
    AStarRecover();
}

function toggleWall(pos) {
    if (map[pos.row][pos.col] == NODE.ROAD) {
        grid.fillGrid(pos.row, pos.col, COLOR.WALL);
        map[pos.row][pos.col] = NODE.WALL;
    } else if (map[pos.row][pos.col] == NODE.WALL) {
        grid.clearGrid(pos.row, pos.col);
        map[pos.row][pos.col] = NODE.ROAD;
    }
}

canvas.onmousedown = function(e) {
    if (!createState || isFinding) return;
    const pos = grid.getPos(e.offsetX, e.offsetY);
    if (isEqualPos(pos, beginPoint)) {
        isBeginMove = true;
        map[beginPoint.row][beginPoint.col] = NODE.ROAD;
    } else if (isEqualPos(pos, endPoint)) {
        isEndMove = true;
        map[endPoint.row][endPoint.col] = NODE.ROAD;
    } else {
        currentPos = {...pos};
        toggleWall(currentPos);
        isDrawWall = true;
    }
}
canvas.onmousemove = function(e) {
    const pos = grid.getPos(e.offsetX, e.offsetY);
    mousepos_span.innerHTML = `row: ${pos.row}, col: ${pos.col}`;
    if (!createState || isFinding) return;
    if (isBeginMove && !isEqualPos(pos, beginPoint)) {
        if (isEqualPos(pos, endPoint)) return;
        grid.clearGrid(beginPoint.row, beginPoint.col);
        if (map[beginPoint.row][beginPoint.col] == NODE.WALL) grid.fillGrid(beginPoint.row, beginPoint.col, COLOR.WALL);
        beginPoint = {...pos};
        grid.fillGrid(beginPoint.row, beginPoint.col, COLOR.BEGIN);
    } else if (isEndMove && !isEqualPos(pos, endPoint)) {
        if (isEqualPos(pos, beginPoint)) return;
        grid.clearGrid(endPoint.row, endPoint.col);
        if (map[endPoint.row][endPoint.col] == NODE.WALL) grid.fillGrid(endPoint.row, endPoint.col, COLOR.WALL);
        endPoint = {...pos};
        grid.fillGrid(endPoint.row, endPoint.col, COLOR.END);
    } else if (isDrawWall && !isEqualPos(currentPos, pos)) {
        currentPos = {...pos};
        toggleWall(currentPos);
    }
}
canvas.onmouseup = function(e) {
    if (!createState || isFinding) return;
    if (!isBeginMove && !isEndMove && !isDrawWall) return;
    // const pos = grid.getPos(e.offsetX, e.offsetY);
    if (isBeginMove) {
        map[beginPoint.row][beginPoint.col] = NODE.BEGIN;
        isBeginMove = false;
    } else if (isEndMove) {
        map[endPoint.row][endPoint.col] = NODE.END;
        isEndMove = false;
    } else if (isDrawWall) {
        isDrawWall = false;
    }
}
canvas.onmouseover = function(e) {
    if (!createState || isFinding) return;
    if (!isBeginMove && !isEndMove && !isDrawWall) return;
    // const pos = grid.getPos(e.offsetX, e.offsetY);
    if (isBeginMove) {
        map[beginPoint.row][beginPoint.col] = NODE.BEGIN;
        isBeginMove = false;
    } else if (isEndMove) {
        map[endPoint.row][endPoint.col] = NODE.END;
        isEndMove = false;
    } else if (isDrawWall) {
        isDrawWall = false;
    }
}

//---------------------Utils-------------------------
function isEqualPos(pos1, pos2) { return pos1.row == pos2.row && pos1.col == pos2.col; }