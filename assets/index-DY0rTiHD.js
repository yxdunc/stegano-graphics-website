(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();function he(e,t,n,r){let o,i;try{const a=C(e,s.__wbindgen_malloc,s.__wbindgen_realloc),c=E,u=C(t,s.__wbindgen_malloc,s.__wbindgen_realloc),U=E,d=C(n,s.__wbindgen_malloc,s.__wbindgen_realloc),y=E,L=C(r,s.__wbindgen_malloc,s.__wbindgen_realloc),N=E,b=s.generate_steg_svg(a,c,u,U,d,y,L,N);return o=b[0],i=b[1],we(b[0],b[1])}finally{s.__wbindgen_free(o,i,1)}}function ve(){return{__proto__:null,"./stegs_bg.js":{__proto__:null,__wbindgen_init_externref_table:function(){const t=s.__wbindgen_externrefs,n=t.grow(4);t.set(0,void 0),t.set(n+0,void 0),t.set(n+1,null),t.set(n+2,!0),t.set(n+3,!1)}}}}function we(e,t){return be(e>>>0,t)}let T=null;function O(){return(T===null||T.byteLength===0)&&(T=new Uint8Array(s.memory.buffer)),T}function C(e,t,n){if(n===void 0){const c=k.encode(e),u=t(c.length,1)>>>0;return O().subarray(u,u+c.length).set(c),E=c.length,u}let r=e.length,o=t(r,1)>>>0;const i=O();let a=0;for(;a<r;a++){const c=e.charCodeAt(a);if(c>127)break;i[o+a]=c}if(a!==r){a!==0&&(e=e.slice(a)),o=n(o,r,r=a+e.length*3,1)>>>0;const c=O().subarray(o+a,o+r),u=k.encodeInto(e,c);a+=u.written,o=n(o,r,a,1)>>>0}return E=a,o}let X=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0});X.decode();const ye=2146435072;let Y=0;function be(e,t){return Y+=t,Y>=ye&&(X=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}),X.decode(),Y=t),X.decode(O().subarray(e,e+t))}const k=new TextEncoder;"encodeInto"in k||(k.encodeInto=function(e,t){const n=k.encode(e);return t.set(n),{read:e.length,written:n.length}});let E=0,s;function xe(e,t){return s=e.exports,T=null,s.__wbindgen_start(),s}async function _e(e,t){if(typeof Response=="function"&&e instanceof Response){if(typeof WebAssembly.instantiateStreaming=="function")try{return await WebAssembly.instantiateStreaming(e,t)}catch(o){if(e.ok&&n(e.type)&&e.headers.get("Content-Type")!=="application/wasm")console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",o);else throw o}const r=await e.arrayBuffer();return await WebAssembly.instantiate(r,t)}else{const r=await WebAssembly.instantiate(e,t);return r instanceof WebAssembly.Instance?{instance:r,module:e}:r}function n(r){switch(r){case"basic":case"cors":case"default":return!0}return!1}}async function Re(e){if(s!==void 0)return s;e!==void 0&&(Object.getPrototypeOf(e)===Object.prototype?{module_or_path:e}=e:console.warn("using deprecated parameters for the initialization function; pass a single object instead")),e===void 0&&(e=new URL(""+new URL("stegs_bg-DUQh-RkR.wasm",import.meta.url).href,import.meta.url));const t=ve();(typeof e=="string"||typeof Request=="function"&&e instanceof Request||typeof URL=="function"&&e instanceof URL)&&(e=fetch(e));const{instance:n,module:r}=await _e(await e,t);return xe(n)}const Ee=""+new URL("stegs_bg-DUQh-RkR.wasm",import.meta.url).href,j=document.querySelector("#steg-output"),S=document.querySelector("#message"),P=document.querySelector("#foreground"),D=document.querySelector("#foreground-alpha"),Q=document.querySelector("#foreground-trigger"),K=document.querySelector("#foreground-popover"),I=document.querySelector("#background"),F=document.querySelector("#background-alpha"),J=document.querySelector("#background-trigger"),Z=document.querySelector("#background-popover"),A=document.querySelector("#steg-type"),w=document.querySelector("#antialiasing"),Ue=document.querySelector("#download-svg"),Le=document.querySelector("#download-png"),f=document.querySelector("#field"),Te=document.querySelector("#ignored-note");let v="",ee=()=>{},$=()=>{};const g={complexity:.28,variant:0,pulse:.2,transparentGround:1},ke=new Set("abcdefghijklmnopqrstuvwxyz ".split(""));await Re(Ee);Pe();h({updateUrl:!1});Oe();S.addEventListener("input",()=>h());P.addEventListener("input",()=>h());D.addEventListener("input",()=>h());I.addEventListener("input",()=>h());F.addEventListener("input",()=>h());A.addEventListener("change",()=>h());w.addEventListener("change",()=>h());Ue.addEventListener("click",Se);Le.addEventListener("click",Ae);ne(Q,K);ne(J,Z);document.addEventListener("click",re);function h({updateUrl:e=!0}={}){const t=M(D),n=M(F);v=Fe(he(S.value,q(P.value,t),q(I.value,n),A.value)),j.innerHTML=v,j.classList.toggle("no-antialiasing",!w.checked),Ce(),Te.hidden=!Be(S.value),g.complexity=Me(v),g.variant=A.value==="fingerprint"?1:0,g.pulse=1,g.transparentGround=n<=.01?1:0,e&&De(),$(v),ee()}function Se(){const e=new Blob([v],{type:"image/svg+xml;charset=utf-8"});te(e,"steg.svg")}async function Ae(){const e=new Blob([v],{type:"image/svg+xml;charset=utf-8"}),t=URL.createObjectURL(e),n=new Image;n.decoding="async",n.src=t,await n.decode();const r=document.createElement("canvas");r.width=2400,r.height=2400;const o=r.getContext("2d");o.imageSmoothingEnabled=w.checked,o.imageSmoothingQuality=w.checked?"high":"low",o.clearRect(0,0,r.width,r.height),o.drawImage(n,0,0,r.width,r.height),URL.revokeObjectURL(t),r.toBlob(i=>{i&&te(i,"steg.png")},"image/png")}function te(e,t){const n=URL.createObjectURL(e),r=document.createElement("a");r.href=n,r.download=t,r.click(),URL.revokeObjectURL(n)}function Me(e){const t=e.match(/<path[^>]* d="([^"]+)"/)?.[1]||"";return Math.min(1,Math.max(.16,t.length/5200))}function Pe(){const e=new URLSearchParams(window.location.search);R(S,e.get("phrase")),R(A,e.get("type")),R(P,e.get("line")),R(D,e.get("lineAlpha")),R(I,e.get("ground")),R(F,e.get("groundAlpha")),Ie(w,e.get("aa"))}function De(){const e=new URLSearchParams;e.set("phrase",S.value),e.set("type",A.value),e.set("line",P.value),e.set("lineAlpha",H(D.value)),e.set("ground",I.value),e.set("groundAlpha",H(F.value)),e.set("aa",w.checked?"true":"false");const t=`${window.location.pathname}?${e.toString()}`;window.history.replaceState(null,"",t)}function R(e,t){t!==null&&(e.type==="color"&&!/^#[0-9a-f]{6}$/i.test(t)||e.type==="range"&&Number.isNaN(Number(t))||e.tagName==="SELECT"&&![...e.options].some(n=>n.value===t)||(e.value=t))}function Ie(e,t){t!==null&&(e.checked=!["0","false","off","no"].includes(t.trim().toLowerCase()))}function Fe(e){const t=w.checked?"geometricPrecision":"crispEdges";return e.replace("<svg ",`<svg shape-rendering="${t}" `)}function q(e,t){if(t<=.01)return"transparent";if(t>=.995)return e;const[n,r,o]=Ge(e);return`rgba(${n}, ${r}, ${o}, ${t.toFixed(2)})`}function Ge(e){const t=e.replace("#","");return[0,2,4].map(n=>parseInt(t.slice(n,n+2),16))}function M(e){return Math.min(1,Math.max(0,Number(e.value)))}function H(e){return M({value:e}).toFixed(2).replace(/0+$/,"").replace(/\.$/,"")}function Be(e){return[...e.trim().toLowerCase()].some(t=>!ke.has(t))}function Ce(){Q.style.setProperty("--swatch",q(P.value,M(D))),J.style.setProperty("--swatch",q(I.value,M(F)))}function ne(e,t){e.addEventListener("click",n=>{n.stopPropagation();const r=t.hidden;re(),t.hidden=!r}),t.addEventListener("click",n=>n.stopPropagation())}function re(){K.hidden=!0,Z.hidden=!0}function Oe(){const e=f.getContext("webgl",{antialias:!1,alpha:!0});if(!e)return;const t=window.matchMedia("(prefers-reduced-motion: reduce)").matches,n={currentX:.5,currentY:.5,targetX:.5,targetY:.5,energy:0};let r=window.innerWidth<760?.62:.9,o=16.7,i=0,a=t,c=!1,u=!1,U=0;const d=128,y=document.createElement("canvas");y.width=d,y.height=d;const L=y.getContext("2d"),N=V(e,e.VERTEX_SHADER,`
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `),b=V(e,e.FRAGMENT_SHADER,`
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
  `),l=e.createProgram();e.attachShader(l,N),e.attachShader(l,b),e.linkProgram(l),e.useProgram(l);const oe=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,oe),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW);const z=e.getAttribLocation(l,"position"),ie=e.getUniformLocation(l,"resolution"),ae=e.getUniformLocation(l,"time"),se=e.getUniformLocation(l,"mouse"),ce=e.getUniformLocation(l,"motion"),le=e.getUniformLocation(l,"complexity"),ue=e.getUniformLocation(l,"variant"),de=e.getUniformLocation(l,"transparentGround"),fe=e.getUniformLocation(l,"lineMask"),ge=e.getUniformLocation(l,"stegRect");e.enableVertexAttribArray(z),e.vertexAttribPointer(z,2,e.FLOAT,!1,0,0);const W=e.createTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,W),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,d,d,0,e.RGBA,e.UNSIGNED_BYTE,null),e.uniform1i(fe,0),$=async m=>{if(!L||!W)return;const G=m.replace(/<rect\b[^>]*><\/rect>|<rect\b[^>]*\/>/g,"").replace(/stroke="[^"]*"/,'stroke="#ffffff"').replace(/stroke-width="[^"]*"/,'stroke-width="28"'),_=URL.createObjectURL(new Blob([G],{type:"image/svg+xml"})),p=new Image;p.decoding="async",p.src=_;try{await p.decode(),L.clearRect(0,0,d,d),L.drawImage(p,0,0,d,d),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,W),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,y),x()}finally{URL.revokeObjectURL(_)}},$(v),window.addEventListener("pointermove",m=>{n.targetX=m.clientX/Math.max(1,window.innerWidth),n.targetY=1-m.clientY/Math.max(1,window.innerHeight),n.energy=Math.min(1,n.energy+.18),a&&!t&&!c?(a=!1,x()):a&&x()},{passive:!0});const x=()=>{u||(u=!0,requestAnimationFrame(me))};ee=x;const me=m=>{if(u=!1,U){const pe=m-U;o=o*.94+pe*.06,o>34?i+=1:i=Math.max(0,i-2),i>90&&r>.55?r=.55:i>180&&(c=!0,a=!0)}U=m;const G=Math.min(window.devicePixelRatio||1,2)*r,_=Math.floor(f.clientWidth*G),p=Math.floor(f.clientHeight*G);(f.width!==_||f.height!==p)&&(f.width=_,f.height=p,e.viewport(0,0,_,p)),n.currentX+=(n.targetX-n.currentX)*.075,n.currentY+=(n.targetY-n.currentY)*.075,n.energy*=.965,g.pulse*=.96,e.uniform2f(ie,f.width,f.height),e.uniform1f(ae,m*.001),e.uniform2f(se,n.currentX,n.currentY),e.uniform1f(ce,Math.max(n.energy,g.pulse)),e.uniform1f(le,g.complexity),e.uniform1f(ue,g.variant),e.uniform1f(de,g.transparentGround);const B=j.getBoundingClientRect();e.uniform4f(ge,B.left/Math.max(1,window.innerWidth),1-B.bottom/Math.max(1,window.innerHeight),B.width/Math.max(1,window.innerWidth),B.height/Math.max(1,window.innerHeight)),e.drawArrays(e.TRIANGLES,0,6),a||x()};x()}function V(e,t,n){const r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}
