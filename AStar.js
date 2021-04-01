class SquareNode {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.parent = null;
        this.h = 10 * (Math.abs(row - endPoint.row) + Math.abs(col - endPoint.col));
        this.isClosed = false;
        this.isOpen = false;
    }

    getPos() { return { row: this.row, col: this.col }; }
    getParent() { return this.parent; }
    calcGAF(parent) {
        let flag = false, tempg;
        if (this.row != parent.row && this.col != parent.col) flag = true;
        if (flag) tempg = parent.g + 14;
        else tempg = parent.g + 10;
        if (!this.g || this.g > tempg) { this.g = tempg; this.parent = parent; }
        this.f = this.g + this.h;
    }
    getFValue() { return this.f; }
}

let nodesInfo;
let openList;
let closeList;
let paths;
let drawPathVertex;
let runFinished;
let runFinishing;
let successful;
let isFinding = false;
const runSpeed = 3;

function AStar() {
    if (successful) return;
    grid.openLoop(singleAStar);
}

function singleAStar() {
    if (runFinishing || runFinished) return true;
    if (!isFinding) { isFinding = true; AStarInit(); }
    if (successful) { result_span.innerHTML = "Search success!!!"; startRunToEnd(); }
    if (openList.length == 0) { result_span.innerHTML = "There is no path to the end!"; return true; }
    AStarLoop();
    if (grid.loopState) { fps_span.innerHTML = grid.getFps().toFixed(2); }
    return false;
}

function startRunToEnd() {
    if (!successful) return true;
    runFinishing = true;
    grid.closeLoop();
    grid.savePicToData();
    let cur = nodesInfo[endPoint.row][endPoint.col];
    while (cur != null) {
        paths.unshift(cur.getPos());
        cur = cur.parent;
    }
    getDrawPathVertex();
    grid.user_data_cur_vertex = 0;
    grid.ctx.strokeStyle = "yellow";
    grid.ctx.lineWidth = 5;
    grid.setLoopFun(runToEndLoop);
    grid.openLoop();
}

function runToEndLoop() {
    grid.drawBackData();
    grid.ctx.beginPath();
    grid.ctx.moveTo(drawPathVertex[0].x, drawPathVertex[0].y);
    for (let i = 1; i < grid.user_data_cur_vertex; i++) {
        const cur = drawPathVertex[i];
        grid.ctx.lineTo(cur.x, cur.y);
    }
    grid.ctx.stroke();
    grid.user_data_cur_vertex++;
    if (grid.user_data_cur_vertex >= drawPathVertex.length) { runFinished = true; return true;}
    if (grid.loopState) { fps_span.innerHTML = grid.getFps().toFixed(2); }
    return false;
}

function getDrawPathVertex() {
    for (let i = 1; i < paths.length; i++) {
        const first = grid.getMiddleCoord(paths[i - 1].row, paths[i - 1].col);
        const second = grid.getMiddleCoord(paths[i].row, paths[i].col);
        const dist = Math.floor(Math.sqrt(Math.pow(Math.abs(first.x - second.x), 2) + Math.pow(Math.abs(first.y - second.y), 2)));
        const x_delta = (second.x - first.x) / (dist / runSpeed);
        const y_delta = (second.y - first.y) / (dist / runSpeed);
        drawPathVertex.push(first);
        for (let j = 1; j < dist / runSpeed; j++) {
            const temp = { x: first.x + j * x_delta, y: first.y + j * y_delta };
            drawPathVertex.push(temp);
        }
        drawPathVertex.push(second);
    }
}

function AStarRecover() {
    isFinding = false;
    successful = false;
    runFinished = false;
    runFinishing = false;
}

function AStarInit() {
    result_span.innerHTML = "Searching...";
    nodesInfo = new Array(ROWS).fill(0).map(() => new Array(COLS).fill(null));
    openList = new Array();
    closeList = new Array();
    paths = new Array();
    drawPathVertex = new Array();
    successful = false;
    runFinished = false;
    runFinishing = false;
    const startNode = new SquareNode(beginPoint.row, beginPoint.col);
    startNode.g = 0;
    startNode.f = startNode.h;
    nodesInfo[beginPoint.row][beginPoint.col] = startNode;
    startNode.isOpen = true;
    openList.push(startNode);
}

function AStarLoop() {
    const cur = openList.splice(getMinNodeId(), 1)[0];
    moveToClose(cur);
    dealAdjoinNode(cur);
}

function getMinNodeId() {
    let min = openList[0].getFValue(), minId = 0;
    for (let i = 1; i < openList.length; i++) {
        const f = openList[i].getFValue();
        if (f < min) { min = f; minId = i; }
    }
    return minId;
}

function moveToClose(node) {
    node.isClosed = true;
    closeList.push(node);
    if (!isEqualPos(node.getPos(), beginPoint) && !isEqualPos(node.getPos(), endPoint))
        grid.fillGrid(node.row, node.col, COLOR.CLOSED);
}

function dealAdjoinNode(node) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i == 0 && j == 0) continue;
            const row = node.row + i;
            const col = node.col + j;
            if (row < 0 || row >= ROWS || col < 0 || col >= COLS) continue;
            if (map[row][col] == NODE.WALL) continue;
            // Ignore illegal bevel
            if (i != 0 && j != 0) {
                if (map[node.row][col] == NODE.WALL || map[row][node.col] == NODE.WALL)
                    continue;
            }
            if (nodesInfo[row][col] == null) nodesInfo[row][col] = new SquareNode(row, col);
            const cur = nodesInfo[row][col];
            if (cur.isClosed) continue;
            if (!cur.isOpen) {
                cur.calcGAF(node);
                openList.push(cur);
                cur.isOpen = true;
                if (!isEqualPos(cur.getPos(), beginPoint) && !isEqualPos(cur.getPos(), endPoint))
                    grid.fillGrid(cur.row, cur.col, COLOR.WAIT);
                if (row == endPoint.row && col == endPoint.col) successful = true;
            }
        }
    }
}