let isVisited;
let waitWallList = new Array();
let tempWallList = new Array();

function primMaze() {
    if (isFinding) return;
    createState = false;
    // initicial isVisited list
    isVisited = new Array(ROWS).fill(0).map(() => new Array(COLS).fill(false));
    // initicial all wall
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            if (((i % 2 == 1 || i + j) % 2 == 1) && map[i][j] == NODE.ROAD) toggleWall({row:i,col:j});
        }
    }
    // random seed
    const beginRow = Math.floor(Math.random() * ROWS / 2) * 2;
    const beginCol = Math.floor(Math.random() * COLS / 2) * 2;
    if (map[beginRow][beginCol] != NODE.ROAD) map[beginRow][beginCol] = NODE.ROAD;
    isVisited[beginRow][beginCol] = true;
    getAdjoinWall(beginRow, beginCol);
    waitWallList.push(...tempWallList);
    // start create
    while (waitWallList.length > 0) {
        const randid = Math.floor(Math.random() * waitWallList.length);
        let wall = waitWallList[randid];
        let road = getUnknowRoad(wall.row, wall.col);
        waitWallList.splice(randid, 1);
        if (road != false) {
            isVisited[road.row][road.col] = true;
            toggleWall(wall);
            getAdjoinWall(road.row, road.col);
            waitWallList.push(...tempWallList);
        }
    }
    // deal with begin and end
    dealBeginAEnd();
    
    createState = true;
}

function getAdjoinWall(row, col) {
    while (tempWallList.length > 0) tempWallList.pop();
    if (row > 0 && map[row - 1][col] == NODE.WALL) tempWallList.push({row:row-1,col:col});
    if (row < ROWS - 1 && map[row + 1][col] == NODE.WALL) tempWallList.push({row:row+1,col:col});
    if (col > 0 && map[row][col - 1] == NODE.WALL) tempWallList.push({row:row,col:col-1});
    if (col < COLS - 1 && map[row][col + 1] == NODE.WALL) tempWallList.push({row:row,col:col+1});
}
function getUnknowRoad(row, col) {
    if (row % 2 == 0) {
        if (map[row][col - 1] ==NODE.ROAD && !isVisited[row][col - 1]) return {row:row,col:col-1};
        if (map[row][col + 1] ==NODE.ROAD && !isVisited[row][col + 1]) return {row:row,col:col+1};
    } else {
        if (map[row - 1][col] ==NODE.ROAD && !isVisited[row - 1][col]) return {row:row-1,col:col};
        if (map[row + 1][col] ==NODE.ROAD && !isVisited[row + 1][col]) return {row:row+1,col:col};
    }
    return false;
}
function dealBeginAEnd() {
    getAdjoinWall(beginPoint.row, beginPoint.col);
    let should = 4;
    if (beginPoint.row == 0) should--;
    else if (beginPoint.row == ROWS - 1) should--;
    if (beginPoint.col == 0) should--;
    else if (beginPoint.col == COLS - 1) should--;
    if (tempWallList.length == should) {
        const tempw = tempWallList[Math.floor(Math.random() * should)];
        toggleWall(tempw);
    }
    getAdjoinWall(endPoint.row, endPoint.col);
    should = 4;
    if (endPoint.row == 0) should--;
    else if (endPoint.row == ROWS - 1) should--;
    if (endPoint.col == 0) should--;
    else if (endPoint.col == COLS - 1) should--;
    if (tempWallList.length == should) {
        const tempw = tempWallList[Math.floor(Math.random() * should)];
        toggleWall(tempw);
    }
}