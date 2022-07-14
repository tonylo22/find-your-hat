/* Find your hat */


// constants
const hat = '^';
const hole = 'O';
const space = '░';
const path = '*';



// helper function to ensure a given grid is playable, using breadth first search
function validateField(grid) {
  // make a grid of boolean values, indicating whether a cell has been searched or not
  let explored = [];
  for (let r = 0; r < grid.length; r++) {
    explored.push([]);
    for (let c = 0; c < grid[0].length; c++) {
      explored[r].push(false);
    }
  }
  // initialize queue for bfs
  let queue = [];
  queue.push([0, 0]);
  explored[0][0] = true;
  // bfs
  let indices;
  let currentCell;
  let neighbours;
  while (queue.length != 0) {
    indices = queue.shift();
    currentCell = grid[indices[0]][indices[1]];
    if (currentCell === hat) {return true;}
    if (currentCell !== hole) {
      // get the surronding cells
      neighbours = getNeighbours(indices[0], indices[1], grid.length-1, grid[0].length-1);
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



// helper function to get surrounding cells for bfs
function getNeighbours(row, col, maxRow, maxCol) {
  const results = [];
  if (row-1 >= 0) {results.push([row-1, col]);}
  if (row+1 <= maxRow) {results.push([row+1, col]);}
  if (col-1 >= 0) {results.push([row, col-1]);}
  if (col+1 <= maxCol) {results.push([row, col+1]);}
  return results;
}



// Field class
class Field {
  constructor(start_grid) {
    this._grid = start_grid;
    this._rows = start_grid.length;
    this._cols = start_grid[0].length;
    this._pos = [0, 0]; // change if not start from top left
    this._inPlay = true;
  }


  get inPlay() {
    return this._inPlay;
  }


  // print the current grid to console
  print() {
    let printed = "";
    for (let row = 0; row < this._rows; row++) {
      for (let col = 0; col < this._cols; col++) {
        printed += this._grid[row][col];
        // printed += " ";
        if (col == this._cols -1 && row < this._rows - 1) {
          printed += "\n";
        }
      }
    }
    console.log(printed);
  }
  // end of print()


  // update field for movement
  move(direction) {
    if (! this._inPlay) {return;}
    const targetList = {
      w: [this._pos[0]-1, this._pos[1]],
      a: [this._pos[0], this._pos[1]-1],
      s: [this._pos[0]+1, this._pos[1]],
      d: [this._pos[0], this._pos[1]+1],
    };
    // if move out of bounds
    const target = targetList[direction];
    if (target[0] < 0 || target[0] >= this._rows || target[1] < 0 || target[1] >= this._cols) {
      this._inPlay = false;
      console.log("You step out of bounds, you lost!");
      return;
    }
    // if move within the field, check the target cell value
    const targetType = this._grid[target[0]][target[1]];
    if (targetType === hole) {
      this._inPlay = false;
      console.log("You fall into a hole, you lost!");
    }
    else if (targetType === path) {
      console.log("There is no going back, move forawrd!");
    }
    else if (targetType === hat) {
      this._inPlay = false;
      console.log("You found the hat, hurray!");
    }
    else {
      this._pos = target;
      this._grid[target[0]][target[1]] = path;
    }
  }
  // end of move()

  
  // make random grid
  static generateField(height, width, percentage=null) {
    let grid;
    // validate inputs
    if (! Number.isInteger(height) || ! Number.isInteger(width) || height <= 0 || width <= 0 || height * width < 2) {
      console.log("Invalid inputs, default to 10x10 field");
      height = 10;
      width = 10;
    }
    
    // The loop below will build the game grid, then check if the hat is reachable from the starting cell. If not, then rebuild.
    do {
      // make grid with all spaces and initial path at top left
      grid = [];
      for (let r = 0; r < height; r++) {
        grid.push([]);
        for (let c = 0; c < width; c++) {
          grid[r].push(space);
        }
      }
      grid[0][0] = path; // change if not start from top left
      
      // calculate number of holes to add
      if (! percentage) {percentage = Math.random() * 50};
      let holesToFill = Math.floor((height * width - 2) * percentage * 0.01);
      
      // add hat
      let randRow;
      let randCol;
      while (true) {
        randRow = Math.floor(Math.random() * height);
        randCol = Math.floor(Math.random() * width);
        if (grid[randRow][randCol] !== space) {continue;}
        else {
          grid[randRow][randCol] = hat;
          break;
        }
      }
      
      // add holes
      while (holesToFill != 0) {
        randRow = Math.floor(Math.random() * height);
        randCol = Math.floor(Math.random() * width);
        if (grid[randRow][randCol] !== space) {continue;}
        else {
          grid[randRow][randCol] = hole;
          holesToFill--;
        }
      }     
    } while(!validateField(grid)) // rebuild grid if not playable
    
    return grid;
  }
  // end of generateField()
}
// end of Field class


// play a game with given field
function game(grid) {
  if (!grid) {return;}
  let move;
  const playingField = new Field(grid);
  console.log("start game (press x to quit)");
  while (playingField.inPlay) {
    playingField.print();
    move = prompt("pick a direction [w/a/s/d]");
    move = move.toLowerCase();
    if (move === "x") {return;}
    if (! "wasd".includes(move)) {
      console.log("Please pick a valid move");
      continue;
    }
    playingField.move(move);
    console.log("\n");
  }
}


// play multiple games with random fields
function randomGames(row, col, percentage=null) {
  let replay;
  let randomField;
  do{
    randomField = Field.generateField(row, col, percentage);
    game(randomField);
    replay = prompt(`Replay? [yes/y/no/n] `);
    console.log("\n");
  } while(replay.toLowerCase() === "yes" || replay.toLowerCase() === "y")
}



// let testGrid = Field.generateField(10, 10, 40);
// const test = new Field(testGrid);
// test.print();
// game(testGrid);
// randomGames(20, 50, 40); // 20 x 50 random fields with 40% holes

