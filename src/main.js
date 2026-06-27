import init, { generate_steg_svg } from "stegs";
import wasmUrl from "stegs/stegs_bg.wasm?url";
import "./styles.css";

const output = document.querySelector("#steg-output");
const messageInput = document.querySelector("#message");
const foregroundInput = document.querySelector("#foreground");
const foregroundAlphaInput = document.querySelector("#foreground-alpha");
const foregroundTrigger = document.querySelector("#foreground-trigger");
const foregroundPopover = document.querySelector("#foreground-popover");
const backgroundInput = document.querySelector("#background");
const backgroundAlphaInput = document.querySelector("#background-alpha");
const backgroundTrigger = document.querySelector("#background-trigger");
const backgroundPopover = document.querySelector("#background-popover");
const typeInput = document.querySelector("#steg-type");
const svgButton = document.querySelector("#download-svg");
const pngButton = document.querySelector("#download-png");
const field = document.querySelector("#field");
const ignoredNote = document.querySelector("#ignored-note");

let currentSvg = "";
let scheduleBackgroundFrame = () => {};
let uploadLineMask = () => {};
const fieldSignal = {
  complexity: 0.28,
  variant: 0,
  pulse: 0.2,
  transparentGround: 1,
};
const supportedCharacters = new Set(
  "abcdefghijklmnopqrstuvwxyz ".split("")
);

await init(wasmUrl);
applyUrlParams();
renderSteg({ updateUrl: false });
startField();

messageInput.addEventListener("input", () => renderSteg());
foregroundInput.addEventListener("input", () => renderSteg());
foregroundAlphaInput.addEventListener("input", () => renderSteg());
backgroundInput.addEventListener("input", () => renderSteg());
backgroundAlphaInput.addEventListener("input", () => renderSteg());
typeInput.addEventListener("change", () => renderSteg());
svgButton.addEventListener("click", downloadSvg);
pngButton.addEventListener("click", downloadPng);
setupColorPopover(foregroundTrigger, foregroundPopover);
setupColorPopover(backgroundTrigger, backgroundPopover);
document.addEventListener("click", closeColorPopovers);

function renderSteg({ updateUrl = true } = {}) {
  const lineAlpha = readAlpha(foregroundAlphaInput);
  const groundAlpha = readAlpha(backgroundAlphaInput);
  currentSvg = generate_steg_svg(
    messageInput.value,
    colorWithAlpha(foregroundInput.value, lineAlpha),
    colorWithAlpha(backgroundInput.value, groundAlpha),
    typeInput.value
  );
  output.innerHTML = currentSvg;
  updateSwatches();
  ignoredNote.hidden = !hasIgnoredCharacters(messageInput.value);
  fieldSignal.complexity = computeComplexity(currentSvg);
  fieldSignal.variant = typeInput.value === "fingerprint" ? 1 : 0;
  fieldSignal.pulse = 1;
  fieldSignal.transparentGround = groundAlpha <= 0.01 ? 1 : 0;
  if (updateUrl) updateUrlParams();
  uploadLineMask(currentSvg);
  scheduleBackgroundFrame();
}

function downloadSvg() {
  const blob = new Blob([currentSvg], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, "steg.svg");
}

async function downloadPng() {
  const svgBlob = new Blob([currentSvg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = 2400;
  canvas.height = 2400;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);

  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, "steg.png");
  }, "image/png");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function computeComplexity(svg) {
  const path = svg.match(/<path[^>]* d="([^"]+)"/)?.[1] || "";
  return Math.min(1, Math.max(0.16, path.length / 5200));
}

function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);
  setValue(messageInput, params.get("phrase"));
  setValue(typeInput, params.get("type"));
  setValue(foregroundInput, params.get("line"));
  setValue(foregroundAlphaInput, params.get("lineAlpha"));
  setValue(backgroundInput, params.get("ground"));
  setValue(backgroundAlphaInput, params.get("groundAlpha"));
}

function updateUrlParams() {
  const params = new URLSearchParams();
  params.set("phrase", messageInput.value);
  params.set("type", typeInput.value);
  params.set("line", foregroundInput.value);
  params.set("lineAlpha", normalizeAlphaParam(foregroundAlphaInput.value));
  params.set("ground", backgroundInput.value);
  params.set("groundAlpha", normalizeAlphaParam(backgroundAlphaInput.value));
  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, "", nextUrl);
}

function setValue(input, value) {
  if (value === null) return;
  if (input.type === "color" && !/^#[0-9a-f]{6}$/i.test(value)) return;
  if (input.type === "range" && Number.isNaN(Number(value))) return;
  if (input.tagName === "SELECT" && ![...input.options].some((option) => option.value === value)) {
    return;
  }
  input.value = value;
}

function colorWithAlpha(hex, alpha) {
  if (alpha <= 0.01) return "transparent";
  if (alpha >= 0.995) return hex;
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16));
}

function readAlpha(input) {
  return Math.min(1, Math.max(0, Number(input.value)));
}

function normalizeAlphaParam(value) {
  return readAlpha({ value }).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function hasIgnoredCharacters(value) {
  return [...value.trim().toLowerCase()].some((character) => !supportedCharacters.has(character));
}

function updateSwatches() {
  foregroundTrigger.style.setProperty(
    "--swatch",
    colorWithAlpha(foregroundInput.value, readAlpha(foregroundAlphaInput))
  );
  backgroundTrigger.style.setProperty(
    "--swatch",
    colorWithAlpha(backgroundInput.value, readAlpha(backgroundAlphaInput))
  );
}

function setupColorPopover(trigger, popover) {
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const shouldOpen = popover.hidden;
    closeColorPopovers();
    popover.hidden = !shouldOpen;
  });
  popover.addEventListener("click", (event) => event.stopPropagation());
}

function closeColorPopovers() {
  foregroundPopover.hidden = true;
  backgroundPopover.hidden = true;
}

function startField() {
  const gl = field.getContext("webgl", { antialias: false, alpha: true });
  if (!gl) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer = {
    currentX: 0.5,
    currentY: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    energy: 0,
  };
  let quality = window.innerWidth < 760 ? 0.62 : 0.9;
  let frameAverage = 16.7;
  let slowFrames = 0;
  let paused = reduceMotion;
  let disabled = false;
  let pendingFrame = false;
  let lastFrame = 0;
  const maskSize = 128;
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = maskSize;
  maskCanvas.height = maskSize;
  const maskContext = maskCanvas.getContext("2d");

  const vertex = compileShader(gl, gl.VERTEX_SHADER, `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform vec2 resolution;
    uniform float time;
    uniform vec2 mouse;
    uniform float motion;
    uniform float complexity;
    uniform float variant;
    uniform float transparentGround;
    uniform sampler2D lineMask;
    uniform vec4 stegRect;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    vec2 hash2(vec2 p) {
      return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
    }

    float particleLayer(vec2 uv, float density, float size, float speed, float seed) {
      vec2 grid = uv * density;
      vec2 cell = floor(grid);
      vec2 local = fract(grid) - 0.5;
      vec2 rnd = hash2(cell + seed);
      vec2 drift = vec2(
        sin(time * speed + rnd.x * 6.283),
        cos(time * speed * 0.73 + rnd.y * 6.283)
      ) * 0.22;
      vec2 point = rnd - 0.5 + drift;
      float d = length(local - point);
      float star = smoothstep(size, 0.0, d);
      float gate = step(0.58 - complexity * 0.16, hash(cell + seed * 7.13));
      return star * gate;
    }

    void main() {
      vec2 screen = gl_FragCoord.xy / resolution;
      vec2 uv = (gl_FragCoord.xy - 0.5 * resolution) / min(resolution.x, resolution.y);
      vec2 pull = mouse - vec2(0.5);
      float r = length(uv);
      float swirl = atan(uv.y, uv.x) * (0.035 + 0.03 * variant) * complexity;
      mat2 rot = mat2(cos(swirl), -sin(swirl), sin(swirl), cos(swirl));
      uv = rot * (uv + pull * motion * 0.055);
      uv.y += time * 0.012;

      vec2 stegUv = (screen - stegRect.xy) / max(stegRect.zw, vec2(0.001));
      float insideSteg = step(0.0, stegUv.x) * step(0.0, stegUv.y) * step(stegUv.x, 1.0) * step(stegUv.y, 1.0);
      float mask = texture2D(lineMask, vec2(stegUv.x, 1.0 - stegUv.y)).a * insideSteg;
      float maskGlow = max(mask, texture2D(lineMask, vec2(stegUv.x + 0.012, 1.0 - stegUv.y)).a * insideSteg);
      maskGlow = max(maskGlow, texture2D(lineMask, vec2(stegUv.x - 0.012, 1.0 - stegUv.y)).a * insideSteg);
      maskGlow = max(maskGlow, texture2D(lineMask, vec2(stegUv.x, 1.0 - stegUv.y + 0.012)).a * insideSteg);
      maskGlow = max(maskGlow, texture2D(lineMask, vec2(stegUv.x, 1.0 - stegUv.y - 0.012)).a * insideSteg);
      float lineField = smoothstep(0.04, 0.54, maskGlow) * transparentGround;
      float halo = smoothstep(0.01, 0.38, maskGlow) * transparentGround;
      float fine = particleLayer(uv, mix(18.0, 25.0, complexity), 0.066, 0.22, 1.0);
      float far = particleLayer(uv + vec2(4.7, -2.1), mix(9.0, 13.0, complexity), 0.052, 0.17, 8.0);
      float wake = smoothstep(0.30, 0.0, distance(mouse, screen)) * motion;
      float lineFine = particleLayer(uv + vec2(1.7, -0.8), mix(28.0, 38.0, complexity), 0.048, 0.36, 21.0);
      float lineParticles = (fine * 1.45 + lineFine * 1.15) * lineField;
      float constellation = fine * 0.52 + lineParticles + far * 0.26 + wake * 0.16;
      float vignette = smoothstep(1.18, 0.08, r);
      float veil = constellation * vignette;
      vec3 ink = vec3(0.015, 0.024, 0.032);
      vec3 ember = vec3(0.18, 0.13, 0.08);
      vec3 blue = vec3(0.04, 0.12, 0.15);
      vec3 color = ink + blue * (0.15 + veil * 0.68) + ember * pow(max(0.0, veil + lineParticles * 0.72), 1.28);
      gl_FragColor = vec4(color, 1.0);
    }
  `);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const position = gl.getAttribLocation(program, "position");
  const resolution = gl.getUniformLocation(program, "resolution");
  const time = gl.getUniformLocation(program, "time");
  const mouse = gl.getUniformLocation(program, "mouse");
  const motion = gl.getUniformLocation(program, "motion");
  const complexity = gl.getUniformLocation(program, "complexity");
  const variant = gl.getUniformLocation(program, "variant");
  const transparentGround = gl.getUniformLocation(program, "transparentGround");
  const lineMask = gl.getUniformLocation(program, "lineMask");
  const stegRect = gl.getUniformLocation(program, "stegRect");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const lineMaskTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, lineMaskTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    maskSize,
    maskSize,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );
  gl.uniform1i(lineMask, 0);

  uploadLineMask = async (svg) => {
    if (!maskContext || !lineMaskTexture) return;
    const maskSvg = svg
      .replace(/<rect\b[^>]*><\/rect>|<rect\b[^>]*\/>/g, "")
      .replace(/stroke="[^"]*"/, 'stroke="#ffffff"')
      .replace(/stroke-width="[^"]*"/, 'stroke-width="28"');
    const url = URL.createObjectURL(new Blob([maskSvg], { type: "image/svg+xml" }));
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    try {
      await image.decode();
      maskContext.clearRect(0, 0, maskSize, maskSize);
      maskContext.drawImage(image, 0, 0, maskSize, maskSize);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, lineMaskTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas);
      scheduleDraw();
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  uploadLineMask(currentSvg);

  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.targetX = event.clientX / Math.max(1, window.innerWidth);
      pointer.targetY = 1 - event.clientY / Math.max(1, window.innerHeight);
      pointer.energy = Math.min(1, pointer.energy + 0.18);
      if (paused && !reduceMotion && !disabled) {
        paused = false;
        scheduleDraw();
      } else if (paused) {
        scheduleDraw();
      }
    },
    { passive: true }
  );

  const scheduleDraw = () => {
    if (pendingFrame) return;
    pendingFrame = true;
    requestAnimationFrame(draw);
  };
  scheduleBackgroundFrame = scheduleDraw;

  const draw = (now) => {
    pendingFrame = false;
    if (lastFrame) {
      const delta = now - lastFrame;
      frameAverage = frameAverage * 0.94 + delta * 0.06;
      if (frameAverage > 34) slowFrames += 1;
      else slowFrames = Math.max(0, slowFrames - 2);
      if (slowFrames > 90 && quality > 0.55) {
        quality = 0.55;
      } else if (slowFrames > 180) {
        disabled = true;
        paused = true;
      }
    }
    lastFrame = now;

    const scale = Math.min(window.devicePixelRatio || 1, 2) * quality;
    const width = Math.floor(field.clientWidth * scale);
    const height = Math.floor(field.clientHeight * scale);
    if (field.width !== width || field.height !== height) {
      field.width = width;
      field.height = height;
      gl.viewport(0, 0, width, height);
    }
    pointer.currentX += (pointer.targetX - pointer.currentX) * 0.075;
    pointer.currentY += (pointer.targetY - pointer.currentY) * 0.075;
    pointer.energy *= 0.965;
    fieldSignal.pulse *= 0.96;

    gl.uniform2f(resolution, field.width, field.height);
    gl.uniform1f(time, now * 0.001);
    gl.uniform2f(mouse, pointer.currentX, pointer.currentY);
    gl.uniform1f(motion, Math.max(pointer.energy, fieldSignal.pulse));
    gl.uniform1f(complexity, fieldSignal.complexity);
    gl.uniform1f(variant, fieldSignal.variant);
    gl.uniform1f(transparentGround, fieldSignal.transparentGround);
    const rect = output.getBoundingClientRect();
    gl.uniform4f(
      stegRect,
      rect.left / Math.max(1, window.innerWidth),
      1 - (rect.bottom / Math.max(1, window.innerHeight)),
      rect.width / Math.max(1, window.innerWidth),
      rect.height / Math.max(1, window.innerHeight)
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (!paused) scheduleDraw();
  };
  scheduleDraw();
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}
