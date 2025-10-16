import { useEffect, useRef, useState } from 'react';
    //useRef helpful to persist between renders and doesn't trigger re-renders
import { vec2, flatten, initShaders } from './webgl-utils';

const MazeGame = () => {
  const canvasRef = useRef(null);
  const [numRows, setNumRows] = useState(5); //change later
  const [numCols, setNumCols] = useState(5); //change later
  const [showPopup, setShowPopup] = useState(false); 
  const [popupMessage, setPopupMessage] = useState('');
  const [showNewMazeButton, setShowNewMazeButton] = useState(false);

  // sstore WebGL context and other state
  const gameStateRef = useRef({
    gl: null,
    program: null,
    positions: [],
    ratCell: null,
    direction: 1,
    colorUniformLocation: null,
    cells: [],
    originalRatCell: null,
    currentRows: 5,
    currentCols: 5,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      alert("WebGL 2.0 isn't available");
      return;
    }

    // webGL config
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // load and use shader program
    const program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);

    // get color uniform location
    const colorUniformLocation = gl.getUniformLocation(program, 'uColor');

    // store in ref
    gameStateRef.current.gl = gl;
    gameStateRef.current.program = program;
    gameStateRef.current.colorUniformLocation = colorUniformLocation;
    gameStateRef.current.currentRows = numRows;
    gameStateRef.current.currentCols = numCols;

    // generate initial maze
    generateMaze();
    loadDataToGPU(gameStateRef.current.positions);
    render();

    // keyboard handler
    const handleKeyPress = (event) => {
      handleKeyPressLogic(event);
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []); // run only once on mount

  const generateMaze = () => {
    const state = gameStateRef.current;
    state.positions = [];
    state.direction = 1;
    const walls = [];

    // use current grid size from ref
    const currentRows = state.currentRows;
    const currentCols = state.currentCols;

    // Initialize cells
    state.cells = new Array(currentRows);
    for (let row = 0; row < currentRows; row++) {
      state.cells[row] = new Array(currentCols);
      for (let col = 0; col < currentCols; col++) {
        state.cells[row][col] = {
          top: true,
          right: true,
          bottom: true,
          left: true,
          visited: false,
        };
      }
    }

    // helper functions
    const clipCoords = (row, col) => {
      const x = (col / currentCols) * 2 - 1;
      const y = 1 - (row / currentRows) * 2;
      return vec2(x, y);
    };

    const addWallSegment = (x1, y1, x2, y2) => {
      state.positions.push(clipCoords(x1, y1));
      state.positions.push(clipCoords(x2, y2));
    };

    const pushWall = (row, col, dir) => {
      walls.push({ row, col, dir });
    };

    const neighborOf = (row, col, dir) => {
      if (dir === 'top') return [row - 1, col, 'bottom'];
      if (dir === 'right') return [row, col + 1, 'left'];
      if (dir === 'bottom') return [row + 1, col, 'top'];
      if (dir === 'left') return [row, col - 1, 'right'];
      return [null, null, null];
    };

    // generate maze with Prim's algorithm
    const startRow = Math.floor(Math.random() * currentRows);
    const startCol = Math.floor(Math.random() * currentCols);
    state.cells[startRow][startCol].visited = true;
    if (startRow > 0) pushWall(startRow, startCol, 'top');
    if (startCol < currentCols - 1) pushWall(startRow, startCol, 'right');
    if (startRow < currentRows - 1) pushWall(startRow, startCol, 'bottom');
    if (startCol > 0) pushWall(startRow, startCol, 'left');

    while (walls.length > 0) {
      const wallIndex = Math.floor(Math.random() * walls.length);
      const wall = walls.splice(wallIndex, 1)[0];
      const { row, col, dir } = wall;
      const [neighborRow, neighborCol, opp] = neighborOf(row, col, dir);

      if (
        neighborRow < 0 ||
        neighborRow >= currentRows ||
        neighborCol < 0 ||
        neighborCol >= currentCols
      ) {
        continue;
      }

      if (state.cells[neighborRow][neighborCol].visited) {
        continue;
      }

      state.cells[row][col][dir] = false;
      state.cells[neighborRow][neighborCol][opp] = false;
      state.cells[neighborRow][neighborCol].visited = true;

      if (neighborRow > 0) pushWall(neighborRow, neighborCol, 'top');
      if (neighborCol < currentCols - 1) pushWall(neighborRow, neighborCol, 'right');
      if (neighborRow < currentRows - 1) pushWall(neighborRow, neighborCol, 'bottom');
      if (neighborCol > 0) pushWall(neighborRow, neighborCol, 'left');
    }

    // choose rat start cell
    const ratStartRow = Math.floor(Math.random() * currentRows);
    state.ratCell = [ratStartRow, 0];
    state.originalRatCell = state.ratCell;
    state.cells[state.originalRatCell[0]][0].left = false;

    // choose exit
    const randomRow = Math.floor(Math.random() * currentRows);
    state.cells[randomRow][currentCols - 1].right = false;

    // build positions from remaining walls
    for (let row = 0; row < currentRows; row++) {
      for (let col = 0; col < currentCols; col++) {
        if (state.cells[row][col].top) addWallSegment(row, col, row, col + 1);
        if (state.cells[row][col].right) addWallSegment(row, col + 1, row + 1, col + 1);
        if (state.cells[row][col].bottom) addWallSegment(row + 1, col, row + 1, col + 1);
        if (state.cells[row][col].left) addWallSegment(row, col, row + 1, col);
      }
    }
  };

  const loadDataToGPU = (dataArray) => {
    const { gl, program } = gameStateRef.current;
    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(dataArray), gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'aPosition');
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
  };

  const render = () => {
    const { gl, colorUniformLocation, positions } = gameStateRef.current;
    gl.clear(gl.COLOR_BUFFER_BIT);
    loadDataToGPU(positions);
    gl.uniform4f(colorUniformLocation, 0.0, 0.0, 0.0, 1.0);
    gl.drawArrays(gl.LINES, 0, positions.length);
    drawRat();
  };

  const createArtVertices = (r, c) => {
    const state = gameStateRef.current;
    const currentRows = state.currentRows;
    const currentCols = state.currentCols;
    
    const segments = 40;
    const cellWidth = 4 / currentCols;
    const cellHeight = 4 / currentRows;
    const cellRadius = 0.5 * Math.min(cellWidth, cellHeight);

    const centerX = ((c + 0.5) / currentCols) * 2 - 1;
    const centerY = 1 - ((r + 0.5) / currentRows) * 2;

    const xRadius = cellRadius * (2 / currentCols);
    const yRadius = cellRadius * (2 / currentRows);
    let circleVertices = [vec2(centerX, centerY)];

    for (let i = 3; i <= (segments * 13) / 14; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = centerX + xRadius * Math.cos(angle);
      const y = centerY + yRadius * Math.sin(angle);
      circleVertices.push(vec2(x, y));
    }
    return circleVertices;
  };

  const rotateVertices = (vertices, x, y, angle) => {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    let result = [];
    for (let i = 0; i < vertices.length; i++) {
      const v = vertices[i];
      const changedX = v[0] - x;
      const changedY = v[1] - y;
      const newX = x + changedX * cosA - changedY * sinA;
      const newY = y + changedX * sinA + changedY * cosA;
      result.push(vec2(newX, newY));
    }
    return result;
  };

  const drawRat = () => {
    const { ratCell, direction, gl, colorUniformLocation, currentRows, currentCols } = gameStateRef.current;
    const [row, col] = ratCell;

    const circleVertices = createArtVertices(row, col);
    const centerX = ((col + 0.5) / currentCols) * 2 - 1;
    const centerY = 1 - ((row + 0.5) / currentRows) * 2;

    let angle = 0;
    if (direction === 1) angle = Math.PI / 2;
    else if (direction === 2) angle = -Math.PI / 2;
    else if (direction === 3) angle = Math.PI;
    else if (direction === 4) angle = 0;

    const rotatedCircle = rotateVertices(circleVertices, centerX, centerY, angle);

    loadDataToGPU(rotatedCircle);
    gl.uniform4f(colorUniformLocation, 1.0, 1.0, 0.0, 1.0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, rotatedCircle.length);
    gl.uniform4f(colorUniformLocation, 0.0, 0.0, 0.0, 1.0);
    gl.drawArrays(gl.LINE_LOOP, 0, rotatedCircle.length);
  };

  const handleKeyPressLogic = (event) => {
    const state = gameStateRef.current;
    const key = event.key;
    const [row, col] = state.ratCell;

    const keyDic = {
      ArrowUp: 1,
      ArrowDown: 2,
      ArrowLeft: 3,
      ArrowRight: 4,
    };

    if (!(key in keyDic)) return;

    const desiredDirection = keyDic[key];

    if (state.direction !== desiredDirection) {
      state.direction = desiredDirection;
      render();
      return;
    }

    let newRow = row;
    let newCol = col;

    if (state.direction === 1 && !state.cells[row][col].top) {
      newRow = row - 1;
    } else if (state.direction === 2 && !state.cells[row][col].bottom) {
      newRow = row + 1;
    } else if (state.direction === 3 && !state.cells[row][col].left) {
      newCol = col - 1;
    } else if (state.direction === 4 && !state.cells[row][col].right) {
      newCol = col + 1;
    }

    if (newCol < 0) {
      setPopupMessage('Cannot exit through entrance.');
      setShowPopup(true);
      setShowNewMazeButton(false);
      return;
    }

    if (newCol === state.currentCols) {
      setPopupMessage('Congrats! You have exited the maze!');
      setShowPopup(true);
      setShowNewMazeButton(true);
      return;
    }

    state.ratCell = [newRow, newCol];
    render();
  };

  const handleGenerate = () => {
    setShowPopup(false);
    setShowNewMazeButton(false);
    // Update the current grid size to match the slider values
    gameStateRef.current.currentRows = numRows;
    gameStateRef.current.currentCols = numCols;
    gameStateRef.current.positions = [];
    generateMaze();
    loadDataToGPU(gameStateRef.current.positions);
    render();
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowNewMazeButton(false);
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      
      <canvas
        ref={canvasRef}
        id="gl-canvas"
        width="512"
        height="512"
        style={{ border: '1px solid black' }}
      />

      <div style={{ margin: '20px 0' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Rows: <span id="row-value">{numRows}</span>
            <input
              type="range"
              id="row-slider"
              min="3"
              max="20"
              value={numRows}
              onChange={(e) => setNumRows(parseInt(e.target.value))}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            Columns: <span id="col-value">{numCols}</span>
            <input
              type="range"
              id="col-slider"
              min="3"
              max="20"
              value={numCols}
              onChange={(e) => setNumCols(parseInt(e.target.value))}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>

        <button
          id="generate"
          onClick={handleGenerate}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Generate New Maze
        </button>
      </div>

      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '30px',
            border: '2px solid black',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
          }}
        >
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>{popupMessage}</p>
          {showNewMazeButton && (
            <button
              onClick={handleGenerate}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              Generate New Maze
            </button>
          )}
          <button
            onClick={closePopup}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      )}

      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={closePopup}
        />
      )}
    </div>
  );
};

export default MazeGame;
