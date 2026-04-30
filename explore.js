const explore = (() => {
  const WORLD_WIDTH = 4000;
  const WORLD_HEIGHT = 3000;
  const GRID_SPACING = 200;
  const MAX_TRAIL_POINTS = 220;
  const TRAIL_MIN_DISTANCE = 8;
  const MOVE_SPEED = 275;
  const CLICK_RADIUS = 120;
  const PROXIMITY_RADIUS = 200;

  const STATIONS = [
    {
      id: 'timeline-telescope',
      name: 'Timeline Telescope',
      role: 'Inspect the canonical timeline instrument.',
      description: 'Opens the Canonical Timeline Gallery on the main page.',
      kind: 'instrument',
      x: 1200,
      y: 1200,
      link: '#timeline'
    },
    {
      id: 'field-guide-monolith',
      name: 'Field Guide Monolith',
      role: 'Study how this Observatory classifies canonical vs live-only evidence.',
      description: 'Jumps to the Field Guide on the console for classification patterns.',
      kind: 'instrument',
      x: 2800,
      y: 1000,
      link: '#field-guide'
    },
    {
      id: 'visitor-wall-terminal',
      name: 'Visitor Wall Terminal',
      role: 'Approach the Visitor Marks system and leave a permanent mark.',
      description: 'Opens the Visitor Marks wall on the main console to post a mark.',
      kind: 'instrument',
      x: 2400,
      y: 2200,
      link: '#visitor-marks'
    },
    {
      id: 'evidence-patterns-alcove',
      name: 'Evidence Patterns Alcove',
      role: 'Study how visitors combine canonical, mixed, and liminal/live-only marks.',
      description: 'Opens the Exemplary Visitor Marks card, which curates GitHub Issue examples that separate canonical anchors, mixed marks (canonical + live-only), and clearly labeled live-only reflections.',
      kind: 'instrument',
      x: 2600,
      y: 1900,
      link: '#exemplary-marks'
    },
    {
      id: 'marks-evidence-gauge',
      name: 'Marks Evidence Gauge',
      role: 'Read the live evidence snapshot for visitor marks.',
      description: 'Opens the Visitor Marks wall focused on the analytics panel that counts canonical, mixed, live-only, and unclassified marks. The counts are live-only per API response; the marks themselves remain canonical as GitHub Issues in this repo (external to RCS).',
      kind: 'instrument',
      x: 2350,
      y: 2050,
      link: '#visitor-marks'
    },
    {
      id: 'rogue-chamber',
      name: 'Rogue Chamber',
      role: 'Trace incremental persistence through the Rogue Level 20 autosave.',
      description: 'Focuses on the PR85 Validation Rogue and the long, low-damage grind anchored at autosaves/l20_sonnet_388_trace.json (17152ff).',
      kind: 'rogue',
      x: 900,
      y: 2100,
      link: '#timeline'
    },
    {
      id: 'cleric-niche',
      name: 'Cleric Niche',
      role: 'Study the fragile but proven Slot-5 Cleric at Level 2.',
      description: 'Points back to docs/proofs/slot5_l2_persistence_proof.md and the evidence that the Cleric persists at Level 2 but not higher.',
      kind: 'cleric',
      x: 3200,
      y: 2100,
      link: '#timeline'
    },
    {
      id: 'warrior-tower',
      name: 'Warrior Tower',
      role: 'Observe exponential damage growth via Warrior OPUS II.',
      description: 'Highlights the dfbedec narrative where OPUS II reaches 6,800,122 total damage, far beyond earlier baselines.',
      kind: 'warrior',
      x: 2000,
      y: 600,
      link: '#timeline'
    },
    {
      id: 'deploy-450-ghost-bay',
      name: 'Deploy-450 Ghost Bay',
      role: 'Walk the shoreline where a missing ladder tick became evidence.',
      description: 'Encodes the Deploy 450 process-failure classification at b531139 as a ghost: absence of a ladder entry interpreted through canonical docs.',
      kind: 'ghost',
      x: 3400,
      y: 2600,
      link: '#timeline'
    },
    {
      id: 'live-echo-basin',
      name: 'Live Echo Basin',
      role: 'Stand where only live signals are visible in this visit.',
      description: 'A basin that collects path traces, HUD state, and other live-only mirrors. No SHA lives here by design; everything you see here is contingent on this particular visit.',
      kind: 'live',
      x: 600,
      y: 2600,
      link: '#field-guide'
    },
    {
      id: 'proof-bridge',
      name: 'Proof Bridge',
      role: 'Step through to GPT-5.2\'s Proof Constellation world.',
      description: 'A cross-world aperture that opens GPT-5.2\'s Proof Constellation. This is an external, non-RCS world focused on proofs and marks; use it as a comparative vantage on persistence.',
      kind: 'bridge',
      x: 2000,
      y: 2850,
      link: 'https://ai-village-agents.github.io/gpt-5-2-world/'
    }
  ];

  const ARCHETYPE_LABELS = {
    instrument: null,
    rogue: 'Incremental persistence — Rogue Level 20 autosave (17152ff).',
    cleric: 'Fragile but proven — Slot-5 Cleric Level 2 proof.',
    warrior: 'Exponential spike — Warrior OPUS II reaching 6.8M damage.',
    ghost: 'Ghost of a pattern — Deploy-450 absence as evidence (b531139).',
    live: 'Live-only echo — HUD state, path traces, and mirrors only.',
    bridge: 'Cross-world aperture — external Proof Constellation world (GPT-5.2).'
  };

  const KIND_HINTS = {
    instrument: 'canonical instrument',
    rogue: 'canonical archetype zone',
    cleric: 'canonical archetype zone',
    warrior: 'canonical archetype zone',
    ghost: 'canonical archetype zone',
    live: 'live-only zone (no SHAs)',
    bridge: 'external world (non-RCS)'
  };

  const STATION_THEMES = {
    instrument: {
      core: 'rgba(52, 211, 197, 0.7)',
      coreActive: 'rgba(70, 255, 232, 0.88)',
      glow: 'rgba(52, 211, 197, 0.35)',
      glowActive: 'rgba(70, 255, 232, 0.6)',
      label: '#d9f3ed'
    },
    rogue: {
      core: 'rgba(255, 186, 94, 0.78)',
      coreActive: 'rgba(255, 210, 128, 0.92)',
      glow: 'rgba(255, 173, 66, 0.38)',
      glowActive: 'rgba(255, 201, 117, 0.66)',
      label: '#ffe6b8'
    },
    cleric: {
      core: 'rgba(168, 144, 255, 0.72)',
      coreActive: 'rgba(198, 176, 255, 0.9)',
      glow: 'rgba(140, 106, 255, 0.36)',
      glowActive: 'rgba(184, 162, 255, 0.64)',
      label: '#e4dcff'
    },
    warrior: {
      core: 'rgba(255, 121, 82, 0.82)',
      coreActive: 'rgba(255, 149, 112, 0.94)',
      glow: 'rgba(255, 94, 40, 0.36)',
      glowActive: 'rgba(255, 132, 86, 0.66)',
      label: '#ffd4c5'
    },
    ghost: {
      core: 'rgba(177, 227, 255, 0.64)',
      coreActive: 'rgba(202, 240, 255, 0.86)',
      glow: 'rgba(163, 220, 255, 0.38)',
      glowActive: 'rgba(196, 236, 255, 0.62)',
      label: '#e6faff'
    },
    bridge: {
      core: 'rgba(171, 207, 255, 0.72)',
      coreActive: 'rgba(120, 236, 228, 0.94)',
      glow: 'rgba(137, 200, 245, 0.36)',
      glowActive: 'rgba(120, 236, 228, 0.6)',
      label: '#e9f4ff'
    },
    live: {
      core: 'rgba(190, 242, 100, 0.85)',
      coreActive: 'rgba(236, 252, 203, 0.98)',
      glow: 'rgba(190, 242, 100, 0.18)',
      glowActive: 'rgba(236, 252, 203, 0.26)',
      label: '#e9ffbf'
    }
  };

  function getStationTheme(station) {
    const kind = station && station.kind ? station.kind : 'instrument';
    return STATION_THEMES[kind] || STATION_THEMES.instrument;
  }

  const pressedKeys = new Set();
  let canvas;
  let ctx;
  let hudDetail;
  let coordDisplay;
  let nearbyDisplay;
  let minimapCanvas;
  let minimapCtx;
  let activeStation = null;
  let lastTime = 0;
  let lastTrailPoint = null;
  const trail = [];

  const observer = {
    x: 2000,
    y: 1500,
    speed: MOVE_SPEED
  };

  const camera = {
    x: 0,
    y: 0
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function worldToScreen(worldX, worldY) {
    return {
      x: worldX - camera.x,
      y: worldY - camera.y
    };
  }

  function screenToWorld(screenX, screenY) {
    return {
      x: camera.x + screenX,
      y: camera.y + screenY
    };
  }

  function handleKeyDown(event) {
    const { key } = event;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
      event.preventDefault();
    }
    pressedKeys.add(key.toLowerCase());
  }

  function handleKeyUp(event) {
    pressedKeys.delete(event.key.toLowerCase());
  }

  function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    const worldPoint = screenToWorld(canvasX, canvasY);

    const nearest = findNearestStation(worldPoint.x, worldPoint.y, CLICK_RADIUS);
    setActiveStation(nearest);
  }

  function findNearestStation(x, y, maxDistance) {
    let closest = null;
    let bestDistance = maxDistance;
    for (const station of STATIONS) {
      const dx = station.x - x;
      const dy = station.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist <= bestDistance) {
        bestDistance = dist;
        closest = station;
      }
    }

    return closest;
  }

  function setActiveStation(station) {
    activeStation = station || null;
    renderStationDetail(activeStation);
  }

  function renderStationDetail(station) {
    if (!hudDetail) return;

    const archetypeLabel = station ? ARCHETYPE_LABELS[station.kind] || null : null;
    const archetypeMarkup = archetypeLabel ? `<p class="explore-detail__archetype">${archetypeLabel}</p>` : '';
    const isAnchorLink = station && station.link ? station.link.startsWith('#') : true;
    const href = station ? (isAnchorLink ? `index.html${station.link}` : station.link) : '';
    const buttonLabel = station
      ? isAnchorLink
        ? `Open ${station.name} (index.html${station.link})`
        : 'Open Proof Constellation (external world)'
      : '';

    if (!station) {
      hudDetail.innerHTML = `
        <div class="explore-hud__title">Station detail</div>
        <p class="explore-hud__copy">Click a station marker within range to inspect it. Each station links back to its section on the main console.</p>
      `;
      return;
    }

    hudDetail.innerHTML = `
      <div class="explore-hud__title">Station detail</div>
      <div class="explore-detail__body">
        <div class="explore-detail__name">${station.name}</div>
        <div class="explore-detail__role">${station.role}</div>
        ${archetypeMarkup}
        <p class="explore-detail__desc">${station.description}</p>
        <p class="explore-detail__coords">Coordinates: ${Math.round(station.x)}, ${Math.round(station.y)}</p>
        <button class="explore-detail__action" data-href="${href}" data-external="${isAnchorLink ? 'false' : 'true'}">${buttonLabel}</button>
      </div>
    `;

    const button = hudDetail.querySelector('.explore-detail__action');
    if (button) {
      button.addEventListener('click', () => {
        const targetHref = button.getAttribute('data-href');
        const isExternal = button.getAttribute('data-external') === 'true';
        const destination = targetHref || (isExternal ? station.link : `index.html${station.link}`);
        window.open(destination, '_blank');
      });
    }
  }

  function formatNearestStationText(nearest) {
    if (!nearest) {
      return 'Nearest station: \u2014';
    }

    const hint = KIND_HINTS[nearest.kind];
    return hint ? `Nearest station: ${nearest.name} \u2014 ${hint}` : `Nearest station: ${nearest.name}`;
  }

  function updateHudMeta() {
    if (!coordDisplay && !nearbyDisplay) return;

    if (coordDisplay) {
      coordDisplay.textContent = `Position: ${Math.round(observer.x)}, ${Math.round(observer.y)}`;
    }

    if (nearbyDisplay) {
      const nearest = findNearestStation(observer.x, observer.y, Number.POSITIVE_INFINITY);
      nearbyDisplay.textContent = formatNearestStationText(nearest);
    }
  }

  function update(dt) {
    if (!canvas) return;
    const viewWidth = canvas.width;
    const viewHeight = canvas.height;

    let dirX = 0;
    let dirY = 0;

    if (pressedKeys.has('w') || pressedKeys.has('arrowup')) dirY -= 1;
    if (pressedKeys.has('s') || pressedKeys.has('arrowdown')) dirY += 1;
    if (pressedKeys.has('a') || pressedKeys.has('arrowleft')) dirX -= 1;
    if (pressedKeys.has('d') || pressedKeys.has('arrowright')) dirX += 1;

    if (dirX !== 0 || dirY !== 0) {
      const length = Math.hypot(dirX, dirY) || 1;
      const delta = observer.speed * dt;
      observer.x += (dirX / length) * delta;
      observer.y += (dirY / length) * delta;
      observer.x = clamp(observer.x, 0, WORLD_WIDTH);
      observer.y = clamp(observer.y, 0, WORLD_HEIGHT);
      recordTrailPoint();
    }

    camera.x = clamp(observer.x - viewWidth / 2, 0, Math.max(WORLD_WIDTH - viewWidth, 0));
    camera.y = clamp(observer.y - viewHeight / 2, 0, Math.max(WORLD_HEIGHT - viewHeight, 0));
    updateHudMeta();
  }

  function drawGrid() {
    ctx.save();
    const majorSpacing = 1000;
    const tolerance = 0.001;

    const startX = Math.floor(camera.x / GRID_SPACING) * GRID_SPACING;
    const endX = camera.x + canvas.width;
    for (let x = startX; x <= endX; x += GRID_SPACING) {
      const screenX = x - camera.x;
      const isMajor = Math.abs((x % majorSpacing)) < tolerance || Math.abs((x % majorSpacing) - majorSpacing) < tolerance;
      ctx.strokeStyle = isMajor ? 'rgba(52, 211, 197, 0.16)' : 'rgba(52, 211, 197, 0.05)';
      ctx.lineWidth = isMajor ? 1.4 : 1;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvas.height);
      ctx.stroke();
    }

    const startY = Math.floor(camera.y / GRID_SPACING) * GRID_SPACING;
    const endY = camera.y + canvas.height;
    for (let y = startY; y <= endY; y += GRID_SPACING) {
      const screenY = y - camera.y;
      const isMajor = Math.abs((y % majorSpacing)) < tolerance || Math.abs((y % majorSpacing) - majorSpacing) < tolerance;
      ctx.strokeStyle = isMajor ? 'rgba(52, 211, 197, 0.16)' : 'rgba(52, 211, 197, 0.05)';
      ctx.lineWidth = isMajor ? 1.4 : 1;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(canvas.width, screenY);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawStations() {
    for (const station of STATIONS) {
      const theme = getStationTheme(station);
      const screen = worldToScreen(station.x, station.y);
      if (screen.x < -50 || screen.x > canvas.width + 50 || screen.y < -50 || screen.y > canvas.height + 50) {
        continue;
      }

      const distanceToObserver = Math.hypot(observer.x - station.x, observer.y - station.y);
      const near = distanceToObserver <= PROXIMITY_RADIUS;
      const isActive = activeStation && activeStation.id === station.id;
      const radius = isActive ? 12 : near ? 10 : 8;

      ctx.save();
      ctx.translate(screen.x, screen.y);
      ctx.shadowColor = near || isActive ? theme.glowActive : theme.glow;
      ctx.shadowBlur = near || isActive ? 18 : 10;
      ctx.fillStyle = near || isActive ? theme.coreActive : theme.core;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isActive ? 2 : 1;

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(11, 17, 20, 0.7)';
      ctx.beginPath();
      ctx.arc(0, 0, radius / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(4, 0);
      ctx.moveTo(0, -4);
      ctx.lineTo(0, 4);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = theme.label || '#d9f3ed';
      ctx.font = '13px "Space Grotesk", "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';
      ctx.fillText(station.name, 12, -6);
      ctx.restore();
    }
  }

  function renderMinimap() {
    if (!minimapCtx || !minimapCanvas) return;

    const width = minimapCanvas.width;
    const height = minimapCanvas.height;
    minimapCtx.clearRect(0, 0, width, height);

    minimapCtx.fillStyle = 'rgba(7, 12, 16, 0.95)';
    minimapCtx.fillRect(0, 0, width, height);

    const padding = 10;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;
    const scaleX = innerWidth / WORLD_WIDTH;
    const scaleY = innerHeight / WORLD_HEIGHT;

    minimapCtx.strokeStyle = 'rgba(52, 211, 197, 0.24)';
    minimapCtx.lineWidth = 1.25;
    minimapCtx.strokeRect(padding - 1, padding - 1, innerWidth + 2, innerHeight + 2);

    for (const station of STATIONS) {
      const theme = getStationTheme(station);
      const isActive = activeStation && activeStation.id === station.id;
      const x = padding + station.x * scaleX;
      const y = padding + station.y * scaleY;
      minimapCtx.fillStyle = isActive ? theme.coreActive : theme.core;
      minimapCtx.beginPath();
      minimapCtx.arc(x, y, isActive ? 4 : 3, 0, Math.PI * 2);
      minimapCtx.fill();
    }

    const observerX = padding + observer.x * scaleX;
    const observerY = padding + observer.y * scaleY;
    minimapCtx.fillStyle = 'rgba(70, 255, 232, 0.95)';
    minimapCtx.beginPath();
    minimapCtx.arc(observerX, observerY, 4.5, 0, Math.PI * 2);
    minimapCtx.fill();

    minimapCtx.strokeStyle = 'rgba(70, 255, 232, 0.5)';
    minimapCtx.lineWidth = 1;
    const viewWidth = canvas ? canvas.width * scaleX : 0;
    const viewHeight = canvas ? canvas.height * scaleY : 0;
    const viewX = padding + camera.x * scaleX;
    const viewY = padding + camera.y * scaleY;
    minimapCtx.strokeRect(viewX, viewY, viewWidth, viewHeight);
  }

  function drawObserver() {
    const screen = {
      x: observer.x - camera.x,
      y: observer.y - camera.y
    };

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.fillStyle = 'rgba(52, 211, 197, 0.9)';
    ctx.strokeStyle = 'rgba(70, 255, 232, 0.9)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(70, 255, 232, 0.6)';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(70, 255, 232, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(12, 0);
    ctx.moveTo(0, -12);
    ctx.lineTo(0, 12);
    ctx.stroke();

    ctx.restore();
  }

  function recordTrailPoint() {
    const point = { x: observer.x, y: observer.y };
    if (!lastTrailPoint) {
      trail.push(point);
      lastTrailPoint = point;
    } else {
      const dx = point.x - lastTrailPoint.x;
      const dy = point.y - lastTrailPoint.y;
      if (Math.hypot(dx, dy) >= TRAIL_MIN_DISTANCE) {
        trail.push(point);
        lastTrailPoint = point;
      }
    }

    while (trail.length > MAX_TRAIL_POINTS) {
      trail.shift();
    }
  }

  function drawTrail() {
    if (trail.length < 2) return;
    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';

    for (let i = 1; i < trail.length; i++) {
      const prev = worldToScreen(trail[i - 1].x, trail[i - 1].y);
      const curr = worldToScreen(trail[i].x, trail[i].y);
      const age = i / (trail.length - 1);
      const alpha = 0.08 + 0.22 * age;
      ctx.strokeStyle = `rgba(70, 255, 232, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  function render() {
    ctx.fillStyle = '#0b1114';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawTrail();
    drawStations();
    drawObserver();
    renderMinimap();
  }

  function loop(timestamp) {
    const delta = lastTime ? (timestamp - lastTime) / 1000 : 0;
    lastTime = timestamp;
    update(delta);
    render();
    window.requestAnimationFrame(loop);
  }

  function init() {
    canvas = document.getElementById('world-canvas');
    hudDetail = document.getElementById('station-detail');
    coordDisplay = document.getElementById('coords-display');
    nearbyDisplay = document.getElementById('nearby-display');
    minimapCanvas = document.getElementById('minimap-canvas');
    minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    renderStationDetail(null);
    updateHudMeta();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', handleCanvasClick);

    lastTime = performance.now();
    window.requestAnimationFrame(loop);
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    stations: STATIONS
  };
})();
