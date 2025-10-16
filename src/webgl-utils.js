// WebGL utility functions

export function vec2(x, y) {
  return [x, y];
}

export function flatten(arr) {
  const flat = [];
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      for (let j = 0; j < arr[i].length; j++) {
        flat.push(arr[i][j]);
      }
    } else {
      flat.push(arr[i]);
    }
  }
  return new Float32Array(flat);
}

export function initShaders(gl, vertexShaderId, fragmentShaderId) {
  // Get shader source from script tags
  const vertexShaderScript = document.getElementById(vertexShaderId);
  const fragmentShaderScript = document.getElementById(fragmentShaderId);
  
  if (!vertexShaderScript || !fragmentShaderScript) {
    console.error('Shader scripts not found');
    return null;
  }

  const vertexShaderSource = vertexShaderScript.text;
  const fragmentShaderSource = fragmentShaderScript.text;

  // Compile shaders
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  // Create and link program
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
