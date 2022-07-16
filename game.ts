/* find your hat typescript */

// constants
const hat = '^';
const hole = 'O';
const space = '░';
const path = '*';

// type alias
type coords = [number, number];


// Field class
class Field {
    // instance fields
    _grid: string[][];
    _rows: number;
    _cols: number;
    _pos: coords;
    inPlay: boolean;


    // constructor
    constructor(start_grid: string[][]) {
        this._grid = start_grid;
        this._rows = start_grid.length;
        this._cols = start_grid[0].length;
        this._pos = this.getStartPos(start_grid);
        this.inPlay = true;
    }


    // helper method to determine the starting pos of a grid
    private getStartPos(grid: string[][]): coords {
        let answer: coords = [0, 0];
        for (let r=0; r < grid.length; r++) {
            for (let c=0; c < grid[0].length; c++) {
                if (grid[r][c] === path) {
                    answer = [r, c];
                }
            }
        }
        return answer;
    }


    // print a string representation of the current field
    print(): void {
        let field = "";
        for (const row of this._grid) {
            field += row.join("");
            field += "\n";
        }
        console.log(field);
    }


    // move path and check for win/loss
    move(direction: string): void {
        if (! this.inPlay) {return;}
        let target: coords = [0, 0];
        // check if moving out of bounds
        switch (direction.toLowerCase()) {
            case "w":
                target = [this._pos[0]-1, this._pos[1]];
                if (target[0] < 0) {
                    this.inPlay = false;
                    console.log("You step out of bounds, you lost!");
                    return;
                }
                break;
            case "a":
                target = [this._pos[0], this._pos[1]-1];
                if (target[1] < 0) {
                    this.inPlay = false;
                    console.log("You step out of bounds, you lost!");
                    return;
                }
                break;
            case "s":
                target = [this._pos[0]+1, this._pos[1]];
                if (target[0] >= this._rows) {
                    this.inPlay = false;
                    console.log("You step out of bounds, you lost!");
                    return;
                }
                break;
            case "d":
                target = [this._pos[0], this._pos[1]+1];
                if (target[1] >= this._cols) {
                    this.inPlay = false;
                    console.log("You step out of bounds, you lost!");
                    return;
                }
                break;
            default:
                console.log("Invalid direction, try again!");
        }
        // if move within the field, check the target cell value
        const targetType = this._grid[target[0]][target[1]];
        if (targetType === hole) {
            this.inPlay = false;
            console.log("You fall into a hole, you lost!");
        }
        else if (targetType === path) {
            console.log("You can't walk the same path twice, move elsewhere!");
        }
        else if (targetType === hat) {
            this.inPlay = false;
            console.log("You found the hat, hurray!");
        }
        else {
            this._pos = target;
            this._grid[target[0]][target[1]] = path;
        }
    }


    // generate random field
    static generateField(height: number, width: number, percentage: number = -1, randomStart: boolean = false): string[][] {
        let randRow: number;
        let randCol: number;
        let grid: string[][];
        // The loop below will build the game grid
        // then check if the hat is reachable from the starting cell
        // If not, then rebuild
        do {
            grid = [];
            // create grid with all spaces
            for (let r=0; r < height; r++) {
                grid.push([]);
                for (let c=0; c < width; c++) {
                    grid[r].push(space);
                }
            }
            // add initial path (at (0, 0) or random)
            if (!randomStart) {grid[0][0] = path;}
            else {
                randRow = Math.floor(Math.random() * height);
                randCol = Math.floor(Math.random() * width);
                grid[randRow][randCol] = path;
            }
            // add hat at random position
            while(true) {
                randRow = Math.floor(Math.random() * height);
                randCol = Math.floor(Math.random() * width);
                if (grid[randRow][randCol] === space) {
                    grid[randRow][randCol] = hat;
                    break;
                }
                else {continue;}
            }
            // add random holes
            if (percentage < 0 || percentage > 75) {percentage = Math.random() * 50;}
            let holesToAdd = Math.floor((height * width - 2) * percentage * 0.01);
            while(holesToAdd > 0) {
                randRow = Math.floor(Math.random() * height);
                randCol = Math.floor(Math.random() * width);
                if (grid[randRow][randCol] === space) {
                    grid[randRow][randCol] = hole;
                    holesToAdd--;
                }
                else {continue;}
            }
        } while(!Field.validateField(grid))
 
        return grid;
    }


    // helper method to ensure a grid is playable, using breadth first search
    static validateField(grid: string[][]): boolean {
        const queue: coords[] = [];  // a queue for bfs
        const explored: boolean[][] = [];
        // create a grid to indicate whether the cells have been explored
        // all cells are initialized to false, except the starting pos is true
        for (let r=0; r < grid.length; r++) {
            explored.push([]);
            for (let c=0; c < grid[0].length; c++) {
                if (grid[r][c] === path) {
                    explored[r].push(true);
                    queue.push([r, c]);  // initialize bfs starting point
                }
                else {explored[r].push(false);}
            }
        }
        // bfs
        let currentPos: coords;
        let currentCell: string;
        let neighbours: coords[];
        while (queue.length != 0) {
            currentPos = queue.shift()!;
            currentCell = grid[currentPos[0]][currentPos[1]];
            if (currentCell === hat) {return true;}
            if (currentCell !== hole) {
                // get the surrounding cells
                neighbours = Field.getNeighbours(currentPos[0], currentPos[1], grid.length-1, grid[0].length-1);
                for (const cell of neighbours) {
                    if (! explored[cell[0]][cell[1]]) {
                        queue.push(cell);
                        explored[cell[0]][cell[1]] = true;
                    }
                }
            }
        }
        return false;
    }


    // helper method to get the four surronding cells for bfs
    static getNeighbours(row: number, col: number, maxRow: number, maxCol: number): coords[] {
        const results: coords[] = [];
        if (row-1 >= 0) {results.push([row-1, col]);}
        if (row+1 <= maxRow) {results.push([row+1, col]);}
        if (col-1 >= 0) {results.push([row, col-1]);}
        if (col+1 <= maxCol) {results.push([row, col+1]);}
        return results;
      }
}
// end of Field class


// play a game with given field
function game(grid: string[][]) {
    let move: string;
    const playingField = new Field(grid);
    console.log("start game (press x to quit / when stuck)");
    while (playingField.inPlay) {
      playingField.print();
      move = prompt("pick a direction [w/a/s/d]")!;
      move = move.toLowerCase();
      if (move === "x") {return;}
      if (! "wasd".includes(move)) {
        console.log("Please pick a valid move\n");
        continue;
      }
      playingField.move(move);
      console.log("\n");
    }
  }
  

// play multiple games with random fields
function randomGames(row: number, col: number, percentage:number = -1, randomStart: boolean = false) {
    let replay: string;
    let randomField: string[][];
    do{
      randomField = Field.generateField(row, col, percentage, randomStart);
      game(randomField);
      replay = prompt(`Replay? [yes/y/no/n] `)!;
      console.log("\n");
    } while(replay.toLowerCase() === "yes" || replay.toLowerCase() === "y")
  }


// const test = new Field([
//     ['░', '░', '*'],
//     ['░', '░', '░'],
//     ['^', '░', '░']
// ]);
// test.print();
// console.log(test._pos);

// const testGrid = Field.generateField(10, 20, 40);
// const test = new Field(testGrid);
// test.print();

// arguments: height(rows), width(cols), holes percentage, random start
randomGames(10, 20, 40, true);