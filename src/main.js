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
const effectInput = document.querySelector("#visual-effect");
const antialiasingInput = document.querySelector("#antialiasing");
const svgButton = document.querySelector("#download-svg");
const pngButton = document.querySelector("#download-png");
const pngConfirmButton = document.querySelector("#confirm-png");
const pngPopover = document.querySelector("#png-popover");
const field = document.querySelector("#field");
const particleCanvas = document.querySelector("#steg-particles");
const renderShell = document.querySelector(".render-shell");
const ignoredNote = document.querySelector("#ignored-note");

let currentSvg = "";
let scheduleBackgroundFrame = () => {};
let rebuildParticleLine = () => {};
let syncParticleEffect = () => {};
const supportedCharacters = new Set(
  "abcdefghijklmnopqrstuvwxyz ".split("")
);

await init(wasmUrl);
effectInput.checked = !window.matchMedia(
  "(max-width: 759px), (pointer: coarse), (prefers-reduced-motion: reduce)"
).matches;
applyUrlParams();
startParticleLine();
renderSteg({ updateUrl: false });
startField();

messageInput.addEventListener("input", () => renderSteg());
foregroundInput.addEventListener("input", () => renderSteg());
foregroundAlphaInput.addEventListener("input", () => renderSteg());
backgroundInput.addEventListener("input", () => renderSteg());
backgroundAlphaInput.addEventListener("input", () => renderSteg());
typeInput.addEventListener("change", () => renderSteg());
effectInput.addEventListener("change", () => {
  syncParticleEffect();
  renderSteg();
});
antialiasingInput.addEventListener("change", () => renderSteg());
svgButton.addEventListener("click", downloadSvg);
setupPngPopover();
setupColorPopover(foregroundTrigger, foregroundPopover);
setupColorPopover(backgroundTrigger, backgroundPopover);
document.addEventListener("click", closePopovers);

function renderSteg({ updateUrl = true } = {}) {
  const lineAlpha = readAlpha(foregroundAlphaInput);
  const groundAlpha = readAlpha(backgroundAlphaInput);
  currentSvg = applyAntialiasing(
    generate_steg_svg(
      messageInput.value,
      colorWithAlpha(foregroundInput.value, lineAlpha),
      colorWithAlpha(backgroundInput.value, groundAlpha),
      typeInput.value
    )
  );
  output.innerHTML = currentSvg;
  output.classList.toggle("no-antialiasing", !antialiasingInput.checked);
  updateSwatches();
  ignoredNote.hidden = !hasIgnoredCharacters(messageInput.value);
  if (updateUrl) updateUrlParams();
  rebuildParticleLine();
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
  ctx.imageSmoothingEnabled = antialiasingInput.checked;
  ctx.imageSmoothingQuality = antialiasingInput.checked ? "high" : "low";
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

function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);
  setValue(messageInput, params.get("phrase"));
  setValue(typeInput, params.get("type"));
  setValue(foregroundInput, params.get("line"));
  setValue(foregroundAlphaInput, params.get("lineAlpha"));
  setValue(backgroundInput, params.get("ground"));
  setValue(backgroundAlphaInput, params.get("groundAlpha"));
  setChecked(effectInput, params.get("effect"));
  setChecked(antialiasingInput, params.get("aa"));
}

function updateUrlParams() {
  const params = new URLSearchParams();
  params.set("phrase", messageInput.value);
  params.set("type", typeInput.value);
  params.set("line", foregroundInput.value);
  params.set("lineAlpha", normalizeAlphaParam(foregroundAlphaInput.value));
  params.set("ground", backgroundInput.value);
  params.set("groundAlpha", normalizeAlphaParam(backgroundAlphaInput.value));
  params.set("effect", effectInput.checked ? "true" : "false");
  params.set("aa", antialiasingInput.checked ? "true" : "false");
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

function setChecked(input, value) {
  if (value === null) return;
  input.checked = !["0", "false", "off", "no"].includes(value.trim().toLowerCase());
}

function applyAntialiasing(svg) {
  const shapeRendering = antialiasingInput.checked ? "geometricPrecision" : "crispEdges";
  return svg.replace("<svg ", `<svg shape-rendering="${shapeRendering}" `);
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
    closePopovers();
    popover.hidden = !shouldOpen;
  });
  popover.addEventListener("click", (event) => event.stopPropagation());
}

function setupPngPopover() {
  pngButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const shouldOpen = pngPopover.hidden;
    closePopovers();
    pngPopover.hidden = !shouldOpen;
  });
  pngPopover.addEventListener("click", (event) => event.stopPropagation());
  pngConfirmButton.addEventListener("click", () => {
    pngPopover.hidden = true;
    downloadPng();
  });
}

function closeColorPopovers() {
  foregroundPopover.hidden = true;
  backgroundPopover.hidden = true;
}

function closePopovers() {
  closeColorPopovers();
  pngPopover.hidden = true;
}

function startParticleLine() {
  const context = particleCanvas.getContext("2d", { alpha: true });
  if (!context) return;

  let points = [];
  let displacedPoints = new Float32Array(0);
  let renderedLineWidth = 1.5;
  let rebuildFrame = 0;
  let lastDraw = 0;
  let frameAverage = 33;
  let slowFrames = 0;
  let stopped = false;
  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    inside: false,
  };

  syncParticleEffect = () => {
    const enabled = effectInput.checked && !stopped;
    particleCanvas.hidden = !enabled;
    renderShell.classList.toggle("particle-rendering", enabled);
  };
  syncParticleEffect();

  rebuildParticleLine = () => {
    cancelAnimationFrame(rebuildFrame);
    rebuildFrame = requestAnimationFrame(() => {
      const svg = output.querySelector("svg");
      const path = svg?.querySelector("path");
      const viewBox = svg?.viewBox?.baseVal;
      if (!path || !viewBox?.width || !viewBox?.height) {
        points = [];
        return;
      }

      points = sampleParticlePath(
        path.getAttribute("d"),
        { x: viewBox.x, y: viewBox.y, width: viewBox.width, height: viewBox.height },
        Math.max(1, particleCanvas.clientWidth)
      );
      displacedPoints = new Float32Array(points.length * 2);
      renderedLineWidth =
        (Number(path.getAttribute("stroke-width")) || 1) *
        Math.max(1, particleCanvas.clientWidth) /
        viewBox.width;
      particleCanvas.dataset.particleCount = String(points.length);
    });
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      const rect = particleCanvas.getBoundingClientRect();
      pointer.targetX = event.clientX - rect.left;
      pointer.targetY = event.clientY - rect.top;
      pointer.inside =
        pointer.targetX >= 0 &&
        pointer.targetY >= 0 &&
        pointer.targetX <= rect.width &&
        pointer.targetY <= rect.height;
    },
    { passive: true }
  );

  const draw = (now) => {
    if (stopped) return;
    requestAnimationFrame(draw);
    if (!effectInput.checked) {
      lastDraw = 0;
      return;
    }
    if (now - lastDraw < 30) return;

    if (lastDraw) {
      const delta = now - lastDraw;
      frameAverage = frameAverage * 0.94 + delta * 0.06;
      if (frameAverage > 44) slowFrames += 1;
      else slowFrames = Math.max(0, slowFrames - 2);
      if (slowFrames > 180) {
        stopped = true;
        particleCanvas.hidden = true;
        renderShell.classList.remove("particle-rendering");
        return;
      }
    }
    lastDraw = now;

    const rect = particleCanvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * pixelRatio));
    const height = Math.max(1, Math.round(rect.height * pixelRatio));
    if (particleCanvas.width !== width || particleCanvas.height !== height) {
      particleCanvas.width = width;
      particleCanvas.height = height;
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    pointer.x += (pointer.targetX - pointer.x) * 0.18;
    pointer.y += (pointer.targetY - pointer.y) * 0.18;

    const seconds = now * 0.001;
    const radius = rect.width * 0.3;
    const push = rect.width * 0.009;
    const lineAlpha = readAlpha(foregroundAlphaInput);
    const pathLength = points[points.length - 1]?.displayDistance || 1;
    const travellingRadius = Math.min(50, Math.max(30, rect.width * 0.085));
    const travellingSpan = pathLength + travellingRadius * 2;
    const travellingDistance = (seconds * 55) % travellingSpan;
    const travellingCenter =
      -travellingRadius + travellingDistance;
    const travellingPush = Math.min(2.7, Math.max(1.6, rect.width * 0.0048));

    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      let x = point.x * rect.width;
      let y = point.y * rect.height;
      const wobbleX =
        Math.sin(seconds * 0.72 + point.progress * 24) * 1.35 +
        Math.sin(seconds * 0.31 - point.progress * 9) * 0.55;
      const wobbleY =
        Math.cos(seconds * 0.64 + point.progress * 22) * 1.35 +
        Math.sin(seconds * 0.27 + point.progress * 11) * 0.55;
      x += wobbleX;
      y += wobbleY;

      const travellingDistance = point.displayDistance - travellingCenter;
      if (Math.abs(travellingDistance) < travellingRadius) {
        const travellingPosition = travellingDistance / travellingRadius;
        const travellingEnvelope = Math.cos(
          travellingPosition * Math.PI * 0.5
        );
        const travellingOffset =
          Math.sin(travellingPosition * Math.PI) *
          travellingEnvelope *
          travellingPush * 1.15;
        x += point.nx * travellingOffset;
        y += point.ny * travellingOffset;
      }

      if (pointer.inside) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < radius) {
          const directionX = distance > 0.01 ? dx / distance : point.nx;
          const directionY = distance > 0.01 ? dy / distance : point.ny;
          const proximity = 1 - distance / radius;
          const smoothForce = proximity * proximity * (3 - 2 * proximity);
          const centerSoftening = 0.08 + 0.92 * (1 - proximity * proximity);
          const force = smoothForce * centerSoftening;
          x += directionX * force * push;
          y += directionY * force * push;
        }
      }

      displacedPoints[index * 2] = x;
      displacedPoints[index * 2 + 1] = y;
    }

    context.strokeStyle = foregroundInput.value;
    context.globalAlpha = lineAlpha;
    context.lineWidth = antialiasingInput.checked
      ? renderedLineWidth
      : Math.max(1, Math.round(renderedLineWidth));
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    for (let index = 0; index < points.length; index += 1) {
      const x = displacedPoints[index * 2];
      const y = displacedPoints[index * 2 + 1];
      if (index === 0 || points[index - 1].segment !== points[index].segment) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();
    context.globalAlpha = 1;
  };

  requestAnimationFrame(draw);
}

function sampleParticlePath(pathData, viewBox, displayWidth) {
  const tokens = pathData.match(/[A-Za-z]|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi) || [];
  const samples = [];
  let tokenIndex = 0;
  let currentX = 0;
  let currentY = 0;
  let distance = 0;
  let segment = 0;
  const viewScale = displayWidth / viewBox.width;
  const sampleSpacing = 0.85;

  const addPoint = (x, y, nx, ny, distanceIncrement = 0) => {
    distance += distanceIncrement;
    samples.push({
      x: (x - viewBox.x) / viewBox.width,
      y: (y - viewBox.y) / viewBox.height,
      nx,
      ny,
      distance,
      segment,
    });
  };

  while (tokenIndex < tokens.length) {
    const command = tokens[tokenIndex++];
    if (command === "M") {
      segment += 1;
      currentX = Number(tokens[tokenIndex++]);
      currentY = Number(tokens[tokenIndex++]);
      addPoint(currentX, currentY, 0, -1);
      continue;
    }

    if (command === "L") {
      const endX = Number(tokens[tokenIndex++]);
      const endY = Number(tokens[tokenIndex++]);
      const dx = endX - currentX;
      const dy = endY - currentY;
      const length = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(length * viewScale / sampleSpacing));
      const nx = -dy / Math.max(0.001, length);
      const ny = dx / Math.max(0.001, length);
      for (let step = 1; step <= steps; step += 1) {
        const amount = step / steps;
        addPoint(
          currentX + dx * amount,
          currentY + dy * amount,
          nx,
          ny,
          length / steps
        );
      }
      currentX = endX;
      currentY = endY;
      continue;
    }

    if (command === "A") {
      const radiusX = Number(tokens[tokenIndex++]);
      const radiusY = Number(tokens[tokenIndex++]);
      tokenIndex += 1;
      const largeArc = Number(tokens[tokenIndex++]) === 1;
      const sweep = Number(tokens[tokenIndex++]) === 1;
      const endX = Number(tokens[tokenIndex++]);
      const endY = Number(tokens[tokenIndex++]);
      if (Math.hypot(endX - currentX, endY - currentY) < 0.001) {
        currentX = endX;
        currentY = endY;
        continue;
      }
      const arc = resolveCircularArc(currentX, currentY, endX, endY, Math.max(radiusX, radiusY), largeArc, sweep);
      const arcLength = Math.abs(arc.delta) * arc.radius;
      const steps = Math.max(2, Math.ceil(arcLength * viewScale / sampleSpacing));
      for (let step = 1; step <= steps; step += 1) {
        const angle = arc.start + arc.delta * step / steps;
        const nx = Math.cos(angle);
        const ny = Math.sin(angle);
        addPoint(
          arc.cx + nx * arc.radius,
          arc.cy + ny * arc.radius,
          nx,
          ny,
          arcLength / steps
        );
      }
      currentX = endX;
      currentY = endY;
      continue;
    }

    throw new Error(`Unsupported steg path command: ${command}`);
  }

  const totalDistance = Math.max(1, distance);
  const projectedLength = totalDistance * viewScale;
  const complexityCount = Math.max(600, Math.min(14000, Math.ceil(projectedLength / 0.95)));
  const targetCount = Math.min(complexityCount, samples.length);
  const particles = [];
  for (let index = 0; index < targetCount; index += 1) {
    const sourceIndex = Math.round(index * (samples.length - 1) / Math.max(1, targetCount - 1));
    const sample = samples[sourceIndex];
    const progress = sample.distance / totalDistance;
    particles.push({
      ...sample,
      progress,
      displayDistance: sample.distance * viewScale,
    });
  }

  const normalRadius = Math.min(20, Math.max(12, displayWidth * 0.035));
  for (let index = 0; index < particles.length; index += 1) {
    const point = particles[index];
    let previousIndex = index;
    let nextIndex = index;
    while (
      previousIndex > 0 &&
      particles[previousIndex - 1].segment === point.segment &&
      point.displayDistance - particles[previousIndex].displayDistance < normalRadius
    ) {
      previousIndex -= 1;
    }
    while (
      nextIndex < particles.length - 1 &&
      particles[nextIndex + 1].segment === point.segment &&
      particles[nextIndex].displayDistance - point.displayDistance < normalRadius
    ) {
      nextIndex += 1;
    }
    const previous = particles[previousIndex];
    const next = particles[nextIndex];
    const dx = next.x - previous.x;
    const dy = next.y - previous.y;
    const length = Math.hypot(dx, dy);
    if (length > 0.000001) {
      point.nx = -dy / length;
      point.ny = dx / length;
    }
  }
  return particles;
}

function resolveCircularArc(startX, startY, endX, endY, requestedRadius, largeArc, sweep) {
  const halfX = (startX - endX) * 0.5;
  const halfY = (startY - endY) * 0.5;
  const halfDistanceSquared = halfX * halfX + halfY * halfY;
  const radius = Math.max(requestedRadius, Math.sqrt(halfDistanceSquared));
  const factorSign = largeArc === sweep ? -1 : 1;
  const factor = factorSign * Math.sqrt(Math.max(0, (radius * radius - halfDistanceSquared) / Math.max(0.0001, halfDistanceSquared)));
  const cx = (startX + endX) * 0.5 + factor * halfY;
  const cy = (startY + endY) * 0.5 - factor * halfX;
  const start = Math.atan2(startY - cy, startX - cx);
  const end = Math.atan2(endY - cy, endX - cx);
  let delta = end - start;
  if (sweep && delta < 0) delta += Math.PI * 2;
  if (!sweep && delta > 0) delta -= Math.PI * 2;
  return { cx, cy, radius, start, delta };
}

function startField() {
  const gl = field.getContext("webgl", { antialias: false, alpha: true });
  if (!gl) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const disableAnimation = window.matchMedia("(max-width: 759px), (pointer: coarse)").matches;
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
  let paused = reduceMotion || disableAnimation;
  let disabled = false;
  let pendingFrame = false;
  let lastFrame = 0;

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

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec2 screen = gl_FragCoord.xy / resolution;
      float vignette = smoothstep(0.82, 0.12, distance(screen, vec2(0.5)));
      float scan = 0.5 + 0.5 * sin(gl_FragCoord.y * 0.48 + time * 0.42);
      float grain = hash(floor(gl_FragCoord.xy * 0.45) + floor(time * 3.0)) - 0.5;
      float wake = smoothstep(0.24, 0.0, distance(screen, mouse)) * motion;
      vec3 color = vec3(0.012, 0.017, 0.020);
      color += vec3(0.012) * (scan * 0.12 + grain * 0.16 + wake * 0.28) * vignette;
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
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.targetX = event.clientX / Math.max(1, window.innerWidth);
      pointer.targetY = 1 - event.clientY / Math.max(1, window.innerHeight);
      pointer.energy = Math.min(1, pointer.energy + 0.18);
      if (paused && !reduceMotion && !disableAnimation && !disabled) {
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

    gl.uniform2f(resolution, field.width, field.height);
    gl.uniform1f(time, now * 0.001);
    gl.uniform2f(mouse, pointer.currentX, pointer.currentY);
    gl.uniform1f(motion, pointer.energy);
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
