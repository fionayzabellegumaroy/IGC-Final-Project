function generateMazePrims(width, height) {
    // initialize maze walls with all walls
    let maze = Array(height).fill(null).map(() => Array(width).fill(1));
        //Array(height) will create an array of length 'height'    
        //Array.from({ length: height}, mapper) creates iterator for 'height' items
        //and then for each item, call mapper where we fill it with '1'
        //repeat until we have 'height' rows, each with 'width' columns filled with 1s

    //Prim's alg. for generation of corridors

    // start with a random cell (on odd coordinates because odds are walls)
        //Math.floor(width/2) gives number of possible odd positions; so if width is 7, 3 possible corridors 
        //Math.random ^ gives a random number between 0 and 3 exclusive and then floow it to get 0, 1, or 2
        //multiply by 2 to convert corridor index to actual grid coordinate 
        //same logic for height
    let startX = Math.floor(Math.random() * Math.floor(width / 2)) * 2;
    let startY = Math.floor(Math.random() * Math.floor(height / 2)) * 2;
    maze[startY][startX] = 0;  // Changed from ' ' to 0
    
    let walls = [];
    
    // add neighboring walls of start cell
    let directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];
        //[0, -2] up (row doesn't change, col decreases by 2), [0, 2] down, [-2, 0] left, [2, 0] right

    for (let [dx, dy] of directions) {
        // gets neighbor cell coordinates
        let nx = startX + dx; 
        let ny = startY + dy;
        // bounds checking
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            //push wall 
            walls.push([startX + dx/2, startY + dy/2, nx, ny]);
        }
    }
    
    while (walls.length > 0) {
        // pick random wall
        let randomIndex = Math.floor(Math.random() * walls.length);
        let [wallX, wallY, cellX, cellY] = walls.splice(randomIndex, 1)[0];
        
        // if cell on other side is unvisited
        if (maze[cellY][cellX] === 1) {
            // carve passage through wall
            maze[wallY][wallX] = 0;
            maze[cellY][cellX] = 0;
            
            // add neighboring walls of new cell
            for (let [dx, dy] of directions) {
                // get neighboring cell coordinates
                let nx = cellX + dx;
                let ny = cellY + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height && maze[ny][nx] === 1) {
                    // if bounds check passes, push wall
                    walls.push([cellX + dx/2, cellY + dy/2, nx, ny]);
                }
            }
        }
    }

    // add border walls 
    let updatedMaze = new Array(height + 2); // +2 because of top of maze and bottom of maze
    for (let i = 0; i < height + 2; i++){
        updatedMaze[i] = new Array(width + 2); // same thing
        for (let j = 0; j < width + 2; j++){
            // if edge, it is a wall
            if (i === 0 || i === height + 1 || j === 0 || j === width + 1){
                updatedMaze[i][j] = 1;  
            } else {
                // if not an edge, translate maze info into updated maze
                updatedMaze[i][j] = maze[i-1][j-1]; 
            }
        }
    }

    // logic for entrance and exit
    // randomly choose a random row and column for entrance and exit that is set to 0
        // "entrance" is not an opening, you just start from there
        // "exit" is where you want to go to exit the maze; also not an opening either [like barony]
    let startMazeRow, exitMazeRow, startMazeCol, exitMazeCol;

    let foundEntrance = false; 
    let foundExit = false;

    let startPosition, endPosition;

    while (!foundEntrance){
        startMazeRow = Math.floor(Math.random() * height) + 1; // +1 for border offset since we dont care about the borders that are at row/col 0 and height+1/width+1
        while(!foundEntrance){ //might not be the most optimal LOL
            startMazeCol = Math.floor(Math.random() * width) + 1;
            if (updatedMaze[startMazeRow][startMazeCol] === 0){
                foundEntrance = true;
                // set entrance cell to 2
                startPosition = [startMazeRow, startMazeCol];
            }
        }
    }

    while (!foundExit){
        exitMazeRow = Math.floor(Math.random() * height) + 1; // +1 for border offset since we dont care about the borders that are at row/col 0 and height+1/width+1
        while(!foundExit){ //might not be the most optimal LOL
            exitMazeCol = Math.floor(Math.random() * width) + 1;
            if (updatedMaze[exitMazeRow][exitMazeCol] === 0){
                foundExit = true;
                endPosition = [exitMazeRow, exitMazeCol];
            }
        }
    }

    return { maze: updatedMaze, startPosition, endPosition };
}

function printMaze(maze) {
    return maze.map(row => row.join('')).join('\n');
}

// generate and print a 5x5 maze [for now]
let { maze, startPosition, endPosition } = generateMazePrims(15, 15);
export { maze, startPosition, endPosition };