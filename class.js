class Minesweeper {
    static get SIZE() { return 15; }
    static get BOMB() { return "B"; }
    static get EMPTY() { return "E"; }

    static bombs;
    static cells;
    static rows;
    static column;

    constructor(rows = Minesweeper.SIZE, columns = Minesweeper.SIZE, probability_chance = 0.1) {
        // set to values from inputs
        if (rows > 0 && columns > 0 && probability_chance >= 0.0 && probability_chance <= 1.0) {
            this.rows = rows;
            this.columns = columns;
            this.probability_chance = probability_chance;

            // set to default
        } else {
            this.rows = Minesweeper.SIZE;
            this.columns = Minesweeper.SIZE;
            this.probability_chance = 0.1;
        }
        this.cells = [];
        this.bombs = 0;
    }

    init_board(newGame) {
        let text = document.getElementById("game_over");
        text.style.color = 'red';
        text.style.display = 'none';

        this.bombs = 0;

        if (newGame) {

            let img1 = document.createElement('img');
            img1.id = "MinF";
            img1.src = "extra_credit/d0.png";
            img1.style.width = '26px';
            img1.style.height = '46px';

            let img2 = document.createElement('img');
            img2.id = "MinS";
            img2.src = "extra_credit/d0.png";
            img2.style.width = '26px';
            img2.style.height = '46px';

            let img3 = document.createElement('img');
            img3.id = "SecF";
            img3.src = "extra_credit/d0.png";
            img3.style.width = '26px';
            img3.style.height = '46px';

            let img4 = document.createElement('img');
            img4.id = "SecS";
            img4.src = "extra_credit/d0.png";
            img4.style.width = '26px';
            img4.style.height = '46px';

            let colonSpan = document.createElement('span');
            colonSpan.id = "colon"
            colonSpan.style.fontSize = "65px";
            colonSpan.style.position = "relative";
            colonSpan.style.top = "-6px";
            colonSpan.innerHTML = ":";

            document.body.appendChild(img1);
            document.body.appendChild(img2);
            document.body.appendChild(colonSpan);
            document.body.appendChild(img3);
            document.body.appendChild(img4);

            create_line_break();

            let BombLeft = document.createElement('span');
            BombLeft.id = "BL";
            BombLeft.style.display = 'none';
            document.body.appendChild(BombLeft);

            create_line_break();
        }

        // create 2D array with r = row & c = column
        for (let r = 0; r <= this.rows - 1; r++) {

            if (newGame) {
                this.cells[r] = [];
            }

            for (let c = 0; c <= this.columns - 1; c++) {
                if (newGame) {
                    let newCell = create_button();

                    // Add an event listener for left-click to open the cell
                    newCell.addEventListener('click', () => this._open(r, c));

                    // Add an event listener for right-click to flag the cell
                    newCell.addEventListener('contextmenu', (e) => {
                        e.preventDefault(); // Prevent the context menu from appearing
                        this._flag(r, c);
                    });

                    newCell.style.backgroundImage = "url('assets/empty.png')"; // Set the cell's background image

                    this.cells[r][c] = {
                        state: "CLOSE",
                        tag: "NO_FLAG",
                        button: newCell,
                        value: Math.random() < this.probability_chance ? Minesweeper.BOMB : Minesweeper.EMPTY,
                    };
                } else {
                    // If it's not a new game (click "RESET" button), update the existing cell properties
                    let newCell = this.cells[r][c];

                    newCell.button.style.backgroundImage = "url('assets/empty.png')"; // Set the cell's background image
                    newCell.state = "CLOSE";
                    newCell.tag = "NO_FLAG";
                    newCell.value = Math.random() < this.probability_chance ? Minesweeper.BOMB : Minesweeper.EMPTY;
                }
            }

            if (newGame) create_line_break();
        }

        this.flood_fill();
    }

    flood_fill() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.cells[i][j].value === Minesweeper.BOMB) {
                    this.bombs++;

                    for (let x = -1; x <= 1; x++) {
                        for (let y = -1; y <= 1; y++) {
                            if (x === 0 && y === 0) continue;

                            const ni = i + x;
                            const nj = j + y;

                            if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.columns) {
                                if (this.cells[ni][nj].value === Minesweeper.EMPTY) {
                                    this.cells[ni][nj].value = '1';
                                } else if (!isNaN(this.cells[ni][nj].value)) {
                                    this.cells[ni][nj].value = (parseInt(this.cells[ni][nj].value) + 1).toString();
                                }
                            }
                        }
                    }
                } else if (this.cells[i][j].value === Minesweeper.EMPTY) {
                    this.cells[i][j].value = '0';
                }
            }
        }

        let BombLeft = document.getElementById('BL');
        BombLeft.innerHTML = "Bombs left: " + this.bombs;
    }

    lock() {
        for (let r = 0; r <= this.rows - 1; r++) {
            for (let c = 0; c <= this.columns - 1; c++) {
                this.cells[r][c].button.disabled = true;  // disable is js syntax
            }
        }
    }

    unlock() {
        for (let r = 0; r <= this.rows - 1; r++) {
            for (let c = 0; c <= this.columns - 1; c++) {
                this.cells[r][c].button.disabled = false;
            }
        }
    }

    explore(x, y) {
        if (x < 0 || y < 0 || x >= this.rows || y >= this.columns) {
            return;
        }

        const cell = this.cells[x][y];

        if (cell.state !== "CLOSE") {
            return;
        } else if (cell.tag === "FLAG") {
            this.bombs++;
        }


        cell.state = "OPEN";
        cell.button.disabled = true;

        if (cell.value === '0') {
            cell.button.style.backgroundImage = "url('assets/0.png')";

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx !== 0 || dy !== 0) {
                        this.explore(x + dx, y + dy);
                    }
                }
            }
        } else if (!isNaN(cell.value)) { // check if number
            cell.button.style.backgroundImage = "url('assets/" + cell.value + ".png')";
        } else if (cell.value === Minesweeper.BOMB) {
            cell.button.style.backgroundImage = "url('assets/bomb.png')";
            this.lock();

            let text = document.getElementById("game_over")
            text.innerHTML = "You Lost!!!"
            text.style.display = 'block';

            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.columns; j++) {
                    if (this.cells[i][j].value === Minesweeper.BOMB) {
                        this.cells[i][j].button.style.backgroundImage = "url('assets/bomb.png')";
                    }
                }
            }
        }
    }

    is_winning_choice() {
        for (let r = 0; r <= this.rows - 1; r++) {
            for (let c = 0; c <= this.columns - 1; c++) {
                if (this.cells[r][c].state === "CLOSE" && this.cells[r][c].value !== Minesweeper.BOMB) {
                    return false;
                }
            }
        }
        return true;
    }

    _flag(row, column) {
        let cell = this.cells[row][column];

        if (cell.button.disabled || cell.state === "OPEN") {
            return;
        }

        if (cell.tag === "NO_FLAG") {
            cell.tag = "FLAG";
            cell.button.style.backgroundImage = "url('assets/flag.png')";

            this.bombs--;
            let BombLeft = document.getElementById('BL');
            BombLeft.innerHTML = "Bombs left: " + this.bombs;
        } else if (cell.tag === "FLAG") {
            cell.tag = "QUESMASK";
            cell.button.style.backgroundImage = "url('extra_credit/question.png')";

            this.bombs++;
            let BombLeft = document.getElementById('BL');
            BombLeft.innerHTML = "Bombs left: " + this.bombs;
        } else if (cell.tag === "QUESMASK") {
            cell.tag = "NO_FLAG";
            cell.button.style.backgroundImage = "url('assets/empty.png')";
        }
    }

    _open(row, column) {
        if (this.cells[row][column].tag !== "FLAG" && this.cells[row][column].state === "CLOSE") {
            this.explore(row, column);
        }

        if (this.is_winning_choice()) {
            this.lock();

            let output = document.getElementById("game_over");
            output.innerHTML = "You Won!!!";
            output.style.display = 'block';  // block is js syntax
        }

        let BombLeft = document.getElementById('BL');
        BombLeft.innerHTML = "Bombs left: " + this.bombs;
    }
}
