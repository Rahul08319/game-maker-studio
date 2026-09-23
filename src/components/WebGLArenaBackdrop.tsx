import { useEffect, useRef } from "react";

interface WebGLArenaBackdropProps {
  stageId: string;
  isPaused: boolean;
}

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_tint;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;

  float horizon = smoothstep(0.18, 0.82, uv.y);
  vec3 sky = mix(vec3(0.012, 0.021, 0.055), u_tint * 0.16 + vec3(0.024, 0.012, 0.05), uv.y);
  vec3 color = sky;
  float glowA = 0.22 / (length(p - vec2(-0.38, 0.18)) + 0.12);
  float glowB = 0.16 / (length(p - vec2(0.42, -0.12)) + 0.12);
  color += u_tint * glowA + vec3(0.14, 0.25, 0.52) * glowB;

  float road = smoothstep(0.58, 0.12, uv.y);
  vec2 grid = vec2(p.x / max(0.06, (uv.y - 0.08)), 1.0 / max(0.12, uv.y - 0.02));
  float xLine = smoothstep(0.96, 1.0, abs(sin(grid.x * 3.14159)));
  float yLine = smoothstep(0.97, 1.0, abs(sin(grid.y * 1.7)));
  color += (xLine + yLine) * road * (u_tint * 0.38 + vec3(0.04, 0.12, 0.22));

  float buildings = step(0.74, hash(floor(uv * vec2(22.0, 8.0))));
  float buildingBand = step(0.31, uv.y) * step(uv.y, 0.62);
  color *= 1.0 - buildings * buildingBand * 0.18;
  float star = step(0.985, hash(floor(uv * vec2(150.0, 90.0))));
  color += star * (1.0 - horizon) * (0.2 + 0.18 * sin(u_time + uv.x * 70.0));
  color *= 0.86 + 0.14 * pow(1.0 - length(p), 1.8);
  gl_FragColor = vec4(color, 1.0);
}`;

const TINTS: Record<string, [number, number, number]> = {
  city: [0.18, 0.36, 0.95], rooftop: [0.95, 0.22, 0.28], subway: [0.18, 0.68, 0.78], bridge: [0.72, 0.12, 0.22],
};

function makeShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export function WebGLArenaBackdrop({ stageId, isPaused }: WebGLArenaBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!canvas || !gl) return;
    const vertex = makeShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = makeShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "a_position");
    const time = gl.getUniformLocation(program, "u_time");
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const tint = gl.getUniformLocation(program, "u_tint");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    let frameId = 0;
    const started = performance.now();
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * density));
      canvas.height = Math.max(1, Math.round(rect.height * density));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const render = (now: number) => {
      const activeTint = TINTS[stageId] ?? TINTS.city;
      gl.uniform1f(time, (now - started) / 1000);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform3fv(tint, activeTint);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!isPaused) frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment);
    };
  }, [isPaused, stageId]);

  return <canvas ref={canvasRef} aria-hidden="true" className="webgl-arena" />;
}
