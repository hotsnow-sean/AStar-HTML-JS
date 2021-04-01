class GridController {
    constructor(canvas, rows, cols, gridWidth, gridHeight = gridWidth) {
        this.canvas = canvas;
        this.rows = rows;
        this.cols = cols;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.initicial();
    }

    initicial() {
        this.ctx = canvas.getContext('2d');
        this.width = this.gridWidth * this.cols;
        this.height = this.gridHeight * this.rows;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.lineColor = '#302F31';
        this.lineWidth = 2;
        this.lineShowState = true;
        this.background = new Image();
    }

    getContext() { return this.ctx; }

    setLoopFun(callback) { this.loopContext = callback; }
    openLoop(callback) {
        if (this.loopState || (!callback && !this.loopContext)) return;
        if (callback) this.setLoopFun(callback);
        this.lastTimeFrame = Date.now();
        this.nowTimeFrame = Date.now();
        this.fps = 60;
        this.loopState = true;
        this.loop();
    }
    closeLoop() { this.loopState = false; }
    loop() {
        if (!this.loopState) return;
        this.nowTimeFrame = Date.now();
        if (this.nowTimeFrame - this.lastTimeFrame > 1)
            this.fps = 1000 / (this.nowTimeFrame - this.lastTimeFrame);
        this.lastTimeFrame = this.nowTimeFrame;
        if (this.loopContext()) { this.loopState = false; return; }
        window.requestAnimationFrame(this.loop.bind(this));
    }
    getFps() { if (this.loopState) return this.fps; else return 'Loop is not open!' }

    openLineShow() { this.lineShowState = true; }
    closeLineShow() { this.lineShowState = false; }
    // don't receive alpha color
    setLineColor(color) { this.lineColor = color; this.ctx.strokeColor = this.lineColor; }
    setLineWidth(width) { this.lineWidth = width; this.ctx.lineWidth = this.lineWidth; }

    // flag : if need cover backLine
    fillGrid(row, col, color, flag = false) {
        this.ctx.fillStyle = color;
        const x = col * this.gridWidth;
        const y = row * this.gridHeight;
        this.ctx.clearRect(x, y, this.gridWidth, this.gridHeight);
        if (flag || !this.lineShowState) this.ctx.fillRect(x, y, this.gridWidth, this.gridHeight);
        else {
            this.ctx.strokeStyle = this.lineColor;
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.beginPath();
            this.ctx.rect(x, y, this.gridWidth, this.gridHeight);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }

    clearGrid(row, col) {
        const x = col * this.gridWidth;
        const y = row * this.gridHeight;
        this.ctx.clearRect(x, y, this.gridWidth, this.gridHeight);
        if (this.lineShowState) {
            this.ctx.strokeStyle = this.lineColor;
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.beginPath();
            this.ctx.rect(x, y, this.gridWidth, this.gridHeight);
            this.ctx.stroke();
        }
    }

    drawBackLine() {
        if (!this.lineShowState) return;
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.lineWidth = this.lineWidth;
        for (let i = 0; i <= this.rows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridHeight);
            this.ctx.lineTo(this.width, i * this.gridHeight);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridWidth, 0);
            this.ctx.lineTo(i * this.gridWidth, this.height);
            this.ctx.stroke();
        }
    }

    drawBackData() {
        this.clearAll();
        this.ctx.drawImage(this.background, 0, 0);
    }

    clearAll() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        if (this.lineShowState) this.drawBackLine();
    }

    getPos(x, y) {
        let row = Math.floor(y / this.gridHeight);
        let col = Math.floor(x / this.gridWidth);
        if (row >= this.rows) row = this.rows - 1;
        if (col >= this.cols) col = this.cols - 1;
        return { row, col };
    }

    getMiddleCoord(row, col) {
        let cc = this.getCoord(row, col);
        cc.x += this.gridWidth / 2;
        cc.y += this.gridHeight / 2;
        return cc;
    }

    getCoord(row, col) {
        const x = col * this.gridWidth;
        const y = row * this.gridHeight;
        return { x, y };
    }

    savePicToData() {
        this.data = this.canvas.toDataURL();
        this.background.src = this.data;
    }
}