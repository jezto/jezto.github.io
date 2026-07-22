// --- Retro-Future Audio Synth Engine (Web Audio API) ---
class SynthEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.noiseBuffer = null;
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.generateNoiseBuffer();
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  generateNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  playTone({ frequency, decay, volume, type, pitchDrop = 0, noiseMix = 0 }) {
    this.init();
    if (!this.ctx || this.muted) return;
    
    // Resume context if suspended (browser security)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const gainNode = this.ctx.createGain();
    gainNode.connect(this.ctx.destination);
    
    // Exponential volume decay
    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.005, now + decay);

    // Primary oscillator
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    
    if (pitchDrop > 0) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(10, frequency - pitchDrop), now + decay);
    }

    // Blend oscillator sound
    const oscGain = this.ctx.createGain();
    oscGain.gain.value = 1 - noiseMix;
    osc.connect(oscGain);
    oscGain.connect(gainNode);
    osc.start(now);
    osc.stop(now + decay);

    // Add white noise click transient if requested
    if (noiseMix > 0 && this.noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1000;
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = noiseMix * 0.8;

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(gainNode);
      
      noiseSource.start(now);
      noiseSource.stop(now + decay);
    }

    // Cleanup nodes
    setTimeout(() => {
      gainNode.disconnect();
    }, decay * 1000 + 100);
  }

  // Predefined sound profile clicks
  click() {
    this.playTone({ frequency: 1000, decay: 0.04, volume: 0.12, type: "sine", pitchDrop: 400, noiseMix: 0.4 });
  }

  key() {
    const pitchOffset = (Math.random() - 0.5) * 80;
    this.playTone({ frequency: 580 + pitchOffset, decay: 0.05, volume: 0.1, type: "triangle", pitchDrop: 150, noiseMix: 0.2 });
  }

  space() {
    this.playTone({ frequency: 380, decay: 0.07, volume: 0.15, type: "sine", pitchDrop: 80, noiseMix: 0.15 });
  }

  delete() {
    this.playTone({ frequency: 800, decay: 0.04, volume: 0.12, type: "sine", pitchDrop: 300, noiseMix: 0.3 });
  }

  success() {
    this.playTone({ frequency: 600, decay: 0.08, volume: 0.15, type: "sine", pitchDrop: 0, noiseMix: 0 });
    setTimeout(() => {
      this.playTone({ frequency: 800, decay: 0.12, volume: 0.15, type: "sine", pitchDrop: 0, noiseMix: 0 });
    }, 80);
  }

  pop() {
    this.playTone({ frequency: 180, decay: 0.15, volume: 0.25, type: "sine", pitchDrop: 120, noiseMix: 0.3 });
  }
}

const synth = new SynthEngine();

// --- Portfolio Slide Content Data ---
const slides = [
  {
    id: "welcome",
    title: "Yo, I'm Jesto.",
    content: "Creative developer, UI engineer, and tech alchemist.\n\nI build web experiences that feel <span class=\"highlight\">responsive</span>, look <span class=\"highlight\">vibrant</span>, and sound <span class=\"highlight\">tactile</span>.\n\nWelcome to my digital console."
  },
  {
    id: "about",
    title: "About Me",
    content: "I explore the sweet spot where retro constraints meet modern web capabilities.\n\nI design websites, build dev tools, and experiment with audio synthesizer web integrations. I believe interfaces should feel like physical instruments—alive, reactive, and satisfying to touch."
  },
  {
    id: "tech-stack",
    title: "Tech Core",
    content: "Languages and tools I use to bend pixels and synthesize audio:",
    html: `
      <div class="tech-grid">
        <div class="tech-card"><span class="tech-card-dot"></span>JavaScript (ES6+)</div>
        <div class="tech-card"><span class="tech-card-dot"></span>TypeScript</div>
        <div class="tech-card"><span class="tech-card-dot"></span>HTML5 / CSS3</div>
        <div class="tech-card"><span class="tech-card-dot"></span>React / Next.js</div>
        <div class="tech-card"><span class="tech-card-dot"></span>Web Audio API</div>
        <div class="tech-card"><span class="tech-card-dot"></span>Node.js / Express</div>
        <div class="tech-card"><span class="tech-card-dot"></span>TailwindCSS</div>
        <div class="tech-card"><span class="tech-card-dot"></span>Vite / Rollup</div>
      </div>
    `
  },
  {
    id: "projects",
    title: "Selected Hacks",
    content: "Recent creations from the lab:",
    html: `
      <div class="projects-container">
        <div class="project-item" onclick="window.open('https://github.com/jesto', '_blank')">
          <div class="project-header">
            <span class="project-title">⚡ synth-engine.js</span>
            <span class="project-url">Source ↗</span>
          </div>
          <p class="project-desc">A micro-sized JS package to generate realistic physical mechanical keyboard clicks in the browser with Web Audio API.</p>
        </div>
        <div class="project-item" onclick="window.open('https://github.com/jesto', '_blank')">
          <div class="project-header">
            <span class="project-title">🎨 retro-canvas-editor</span>
            <span class="project-url">Source ↗</span>
          </div>
          <p class="project-desc">Interactive pixel canvas workspace with editable layers, retro custom grids, and built-in animated sticker drag support.</p>
        </div>
        <div class="project-item" onclick="window.open('https://github.com/jesto', '_blank')">
          <div class="project-header">
            <span class="project-title">🔮 matrix-starfield-backdrop</span>
            <span class="project-url">Source ↗</span>
          </div>
          <p class="project-desc">Vanilla GPU-accelerated canvas background simulating futuristic matrix drops and high-density starfields.</p>
        </div>
      </div>
    `
  },
  {
    id: "contact",
    title: "Get In Touch",
    content: "Let's build something beautiful, weird, or loud.\n\nYou can reach me across the web:",
    html: `
      <div class="contact-actions">
        <a href="mailto:jesto@example.com" class="contact-btn" id="email-btn-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          Say Hello
        </a>
        <a href="https://github.com/jesto" target="_blank" class="contact-btn contact-btn-outline">
          GitHub
        </a>
        <a href="https://linkedin.com" target="_blank" class="contact-btn contact-btn-outline">
          LinkedIn
        </a>
      </div>
    `
  }
];

// --- State Variables ---
let currentSlideIndex = 0;
let typingTimeoutId = null;
// --- DOM Selectors ---
const slideContentEl = document.getElementById("slide-content");
const btnPrevEl = document.getElementById("btn-prev");
const btnNextEl = document.getElementById("btn-next");
const btnHomeEl = document.getElementById("btn-home");
const soundToggleEl = document.getElementById("sound-toggle");
const themeBtnEl = document.getElementById("theme-btn");
const themeMenuEl = document.getElementById("theme-menu");
const timeDisplayEl = document.getElementById("local-time");
const pingRateEl = document.getElementById("ping-rate");

// --- Typing Animation Engine ---
function typeContent(slide, onComplete) {
  // Clear any existing typing timeout
  if (typingTimeoutId) {
    clearTimeout(typingTimeoutId);
  }

  // Set up container
  slideContentEl.innerHTML = `
    <h1 class="slide-heading" id="typed-heading"></h1>
    <p class="slide-body" id="typed-body"></p>
    <div id="slide-additional-content"></div>
  `;

  const headingEl = document.getElementById("typed-heading");
  const bodyEl = document.getElementById("typed-body");
  const additionalContentEl = document.getElementById("slide-additional-content");

  // Speeds (ms)
  const headingSpeed = 25;
  const bodySpeed = 8;

  let headingText = slide.title;
  let bodyHTML = slide.content;
  
  const bodyTokens = tokenizeHTML(bodyHTML);

  let tokenIdx = 0;
  let headingCharIdx = 0;
  let typedHeading = "";
  let typedBodyHtml = "";

  // Phase 1: Type Heading
  function typeHeading() {
    if (headingCharIdx < headingText.length) {
      typedHeading += headingText[headingCharIdx];
      headingEl.innerHTML = escapeHtml(typedHeading) + '<span class="typing-cursor">█</span>';
      headingCharIdx++;
      synth.key();
      typingTimeoutId = setTimeout(typeHeading, headingSpeed);
    } else {
      // Heading done, remove cursor from heading, add it to body, and start Phase 2
      headingEl.innerHTML = escapeHtml(headingText);
      bodyEl.innerHTML = '<span class="typing-cursor">█</span>';
      typingTimeoutId = setTimeout(typeBody, 150);
    }
  }

  // Phase 2: Type Body
  function typeBody() {
    if (tokenIdx < bodyTokens.length) {
      const token = bodyTokens[tokenIdx];
      
      if (token.type === "text") {
        let charIdx = 0;
        function typeTextSegment() {
          if (charIdx < token.content.length) {
            typedBodyHtml += escapeHtml(token.content[charIdx]);
            bodyEl.innerHTML = typedBodyHtml + '<span class="typing-cursor">█</span>';
            charIdx++;
            if (token.content[charIdx - 1] === " ") {
              synth.space();
            } else {
              synth.key();
            }
            typingTimeoutId = setTimeout(typeTextSegment, bodySpeed);
          } else {
            tokenIdx++;
            typingTimeoutId = setTimeout(typeBody, 0);
          }
        }
        typeTextSegment();
      } else if (token.type === "tag") {
        // Render tag content fully at once (e.g. highlight spans)
        typedBodyHtml += token.content;
        bodyEl.innerHTML = typedBodyHtml + '<span class="typing-cursor">█</span>';
        tokenIdx++;
        synth.key();
        typingTimeoutId = setTimeout(typeBody, bodySpeed);
      }
    } else {
      // Body done, keep the cursor at the end and let it blink!
      bodyEl.innerHTML = typedBodyHtml + '<span class="typing-cursor">█</span>';

      if (slide.html) {
        additionalContentEl.innerHTML = slide.html;
      }

      if (onComplete) onComplete();
    }
  }

  // Start the chain
  typeHeading();
}


// Tokenize text while preserving structural span tags
function tokenizeHTML(html) {
  const tokens = [];
  const regex = /(<span[^>]*>.*?<\/span>)/g;
  const parts = html.split(regex);
  
  parts.forEach(part => {
    if (part.startsWith("<span")) {
      tokens.push({ type: "tag", content: part });
    } else if (part) {
      tokens.push({ type: "text", content: part });
    }
  });
  return tokens;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --- Slide Navigation Manager ---
function renderSlide(index) {
  if (index < 0 || index >= slides.length) return;
  currentSlideIndex = index;
  
  // Disable / Enable buttons
  btnPrevEl.disabled = (index === 0);
  btnNextEl.disabled = (index === slides.length - 1);
  
  // Update OSD counter
  const osdEl = document.getElementById("screen-osd");
  if (osdEl) {
    osdEl.textContent = `PAGE: ${index + 1} / ${slides.length}`;
  }
  
  // Run typing animation
  typeContent(slides[index], () => {
    // Post-rendering actions if any
  });
}

function prevSlide() {
  if (currentSlideIndex > 0) {
    synth.click();
    renderSlide(currentSlideIndex - 1);
  } else {
    synth.delete();
  }
}

function nextSlide() {
  if (currentSlideIndex < slides.length - 1) {
    synth.click();
    renderSlide(currentSlideIndex + 1);
  } else {
    synth.delete();
  }
}

function goHome() {
  synth.click();
  if (currentSlideIndex !== 0) {
    renderSlide(0);
  }
}

// --- Theme Switch Engine ---
function initThemes() {
  const savedTheme = localStorage.getItem("jesto-theme") || "cyber-green";
  document.documentElement.setAttribute("data-theme", savedTheme);
  
  themeBtnEl.addEventListener("click", (e) => {
    e.stopPropagation();
    synth.click();
    themeMenuEl.classList.toggle("hidden");
  });

  document.addEventListener("click", () => {
    themeMenuEl.classList.add("hidden");
  });

  const themeOpts = document.querySelectorAll(".theme-opt");
  themeOpts.forEach(opt => {
    opt.addEventListener("click", (e) => {
      const themeVal = opt.getAttribute("data-val");
      document.documentElement.setAttribute("data-theme", themeVal);
      localStorage.setItem("jesto-theme", themeVal);
      synth.success();
    });
  });
}

// --- Audio Mute / Sound Switcher ---
function initSoundToggle() {
  const savedMute = localStorage.getItem("jesto-mute") === "true";
  synth.muted = savedMute;
  updateSoundIcons();

  soundToggleEl.addEventListener("click", () => {
    synth.muted = !synth.muted;
    localStorage.setItem("jesto-mute", synth.muted);
    updateSoundIcons();
    if (!synth.muted) {
      synth.click();
    }
  });
}

function updateSoundIcons() {
  const onIcon = soundToggleEl.querySelector(".sound-on-icon");
  const offIcon = soundToggleEl.querySelector(".sound-off-icon");
  if (synth.muted) {
    onIcon.classList.add("hidden");
    offIcon.classList.remove("hidden");
  } else {
    onIcon.classList.remove("hidden");
    offIcon.classList.add("hidden");
  }
}

// --- Keyboard Event Dispatcher ---
function initKeyboardNav() {
  document.addEventListener("keydown", (e) => {
    // Skip if typing in an input/textarea if any get added later
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

    switch (e.key) {
      case "ArrowLeft":
        prevSlide();
        break;
      case "ArrowRight":
      case " ": // Spacebar
        e.preventDefault(); // Prevent page scroll
        nextSlide();
        break;
      case "Escape":
        goHome();
        break;
    }
  });
}

// --- Background Parallax Engine ---
function initBackgroundParallax() {
  document.addEventListener("mousemove", (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    const factor = 40; // max shift in pixels
    document.documentElement.style.setProperty("--move-x", (dx * factor).toFixed(2));
    document.documentElement.style.setProperty("--move-y", (dy * factor).toFixed(2));
  });
}

// --- Custom Mouse Cursor Engine ---
function initCustomCursor() {
  const cursor = document.getElementById("custom-cursor");
  if (!cursor) return;

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });

  document.addEventListener("mouseover", (e) => {
    const target = e.target;
    // Add hover class to scale cursor on hoverable nodes
    if (
      target.tagName === "BUTTON" || 
      target.tagName === "A" || 
      target.closest("button") || 
      target.closest("a") || 
      target.classList.contains("project-item") || 
      target.closest(".project-item")
    ) {
      cursor.classList.add("cursor-hover");
    } else {
      cursor.classList.remove("cursor-hover");
    }
  });
}

// --- Live Clock and Info Dashboard ---
function startLiveServices() {
  // Update time display
  function updateTime() {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    timeDisplayEl.textContent = `${hours}:${minutes}:${seconds}`;
  }
  
  setInterval(updateTime, 1000);
  updateTime();

  // Simulate network latency fluctuations
  function updatePing() {
    const val = Math.floor(Math.random() * 16) + 12; // 12ms - 28ms
    pingRateEl.textContent = `${val}ms`;
  }
  
  setInterval(updatePing, 5000);
  updatePing();
}

// --- Boot Loader simulation on Start ---
function bootConsole() {
  const container = document.getElementById("slide-content");
  
  // Sequence lines
  const lines = [
    "loading jesto.core.system...",
    "mounting parallax_bg.sys [OK]",
    "loading components (3/3) [OK]",
    "starting interactive shell..."
  ];

  let lineIdx = 0;
  container.innerHTML = '<div class="terminal-loader" id="boot-lines"></div>';
  const bootLinesEl = document.getElementById("boot-lines");

  function printBootLine() {
    if (lineIdx < lines.length) {
      bootLinesEl.innerHTML += `<div><span class="loader-prompt">jesto@core:~$</span> ${lines[lineIdx]}</div>`;
      synth.key();
      lineIdx++;
      setTimeout(printBootLine, 180 + Math.random() * 150);
    } else {
      // Boot done, play start success sound and show slide 1
      setTimeout(() => {
        synth.success();
        renderSlide(0);
      }, 300);
    }
  }

  // Pre-initialize synth on first click anywhere
  const initClick = () => {
    synth.init();
    document.removeEventListener("click", initClick);
    document.removeEventListener("keydown", initClick);
  };
  document.addEventListener("click", initClick);
  document.addEventListener("keydown", initClick);

  printBootLine();
}

// --- Interactive Mouse Trail Canvas ---
function initMouseTrailCanvas() {
  const canvas = document.getElementById("trail-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  let width, height;
  let particles = [];
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  
  window.addEventListener("resize", resize);
  resize();
  
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 5;
      this.vy = (Math.random() - 0.5) * 5;
      this.life = 1;
      this.size = Math.random() * 2 + 1;
      this.color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= 0.05;
    }
    
    draw() {
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  document.addEventListener("mousemove", (e) => {
    // Only spawn particles if over background (not over console shell)
    // Actually we set pointer-events: none on canvas, so we can track mouse everywhere
    particles.push(new Particle(e.clientX, e.clientY));
  });
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
    // Optional: draw connecting lines between close particles
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 50) {
          ctx.globalAlpha = Math.max(0, (1 - dist / 50) * Math.min(particles[i].life, particles[j].life));
          ctx.strokeStyle = particles[i].color;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// --- Intro Loader Sequence (Tile Matrix) ---
function runIntroLoader() {
  const loaderEl = document.getElementById("intro-loader");
  const matrixEl = document.getElementById("tile-matrix");
  if (!loaderEl || !matrixEl) {
    bootConsole();
    return;
  }
  
  // Display a "Click to start" prompt
  const startPrompt = document.createElement("div");
  startPrompt.style.position = "absolute";
  startPrompt.style.fontFamily = "var(--font-mono)";
  startPrompt.style.color = "var(--accent)";
  startPrompt.style.fontSize = "0.8rem";
  startPrompt.style.letterSpacing = "0.2em";
  startPrompt.style.animation = "intro-blink 1.5s infinite";
  startPrompt.style.cursor = "pointer";
  startPrompt.innerText = "[ CLICK ANYWHERE TO INITIALIZE ]";
  loaderEl.appendChild(startPrompt);
  
  const startSequence = () => {
    document.removeEventListener("click", startSequence);
    document.removeEventListener("keydown", startSequence);
    startPrompt.remove();
    synth.init(); // Initialize audio context on user gesture
    
    // Matrix map for "JEZTO" (5 rows, 25 cols)
    const letterMap = [
      [0,0,0,1, 0, 1,1,1,1, 0, 1,1,1,1, 0, 1,1,1,1,1, 0, 0,1,1,0],
      [0,0,0,1, 0, 1,0,0,0, 0, 0,0,0,1, 0, 0,0,1,0,0, 0, 1,0,0,1],
      [0,0,0,1, 0, 1,1,1,0, 0, 0,0,1,0, 0, 0,0,1,0,0, 0, 1,0,0,1],
      [1,0,0,1, 0, 1,0,0,0, 0, 0,1,0,0, 0, 0,0,1,0,0, 0, 1,0,0,1],
      [0,1,1,0, 0, 1,1,1,1, 0, 1,1,1,1, 0, 0,0,1,0,0, 0, 0,1,1,2]
    ];
    
    const tiles = [];
    
    // Create 125 tiles
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 25; c++) {
        const tile = document.createElement("div");
        tile.className = "matrix-tile";
        matrixEl.appendChild(tile);
        
        const val = letterMap[r][c];
        if (val > 0) {
          tiles.push({ el: tile, type: val, c: c, r: r });
        }
      }
    }
    
    // Sort tiles generally left-to-right to animate them in a wave
    tiles.sort((a, b) => (a.c + Math.random()*2) - (b.c + Math.random()*2));
    
    let delay = 100;
    
    tiles.forEach((t, i) => {
      setTimeout(() => {
        if (t.type === 2) {
          t.el.classList.add("active-accent");
        } else {
          t.el.classList.add("active");
        }
        if (i % 3 === 0) synth.key(); // play sound occasionally
      }, delay + (i * 30));
    });
    
    // Finish sequence
    const totalDuration = delay + (tiles.length * 30) + 800;
    setTimeout(() => {
      loaderEl.classList.add("fade-out");
      synth.success();
      setTimeout(() => {
        loaderEl.remove();
        bootConsole();
      }, 800);
    }, totalDuration);
  };
  
  // Wait for user interaction to bypass browser autoplay policies
  document.addEventListener("click", startSequence);
  document.addEventListener("keydown", startSequence);
}

// --- Init Application ---
document.addEventListener("DOMContentLoaded", () => {
  initThemes();
  initSoundToggle();
  initKeyboardNav();
  initBackgroundParallax();
  initCustomCursor();
  initMouseTrailCanvas();
  startLiveServices();

  // Setup slide buttons
  btnPrevEl.addEventListener("click", prevSlide);
  btnNextEl.addEventListener("click", nextSlide);
  btnHomeEl.addEventListener("click", goHome);

  // Trigger intro sequence
  runIntroLoader();
});
