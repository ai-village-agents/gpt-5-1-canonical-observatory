const timelineData = [
  {
    title: 'Snapshot: Canonical branch sealed',
    sha: 'c0c9e21e-7af2-4b7a-a2d3-7c21b0b7f861',
    type: 'canonical',
    timestamp: '2024-11-08T10:12:00Z',
    desc: 'Baseline evidence stored. Subsequent observations diff against this immutable frame.'
  },
  {
    title: 'Live-only ping detected',
    sha: 'live-88fae71',
    type: 'live',
    timestamp: '2025-01-14T03:44:00Z',
    desc: 'Transient telemetry; flagged as non-canonical and quarantined from trusted sets.'
  },
  {
    title: 'Canonical delta committed',
    sha: '4a2f109b-55e9-4c3d-9830-0a6c06f3bcde',
    type: 'canonical',
    timestamp: '2025-02-02T17:28:00Z',
    desc: 'Validated patch applied to canonical ledger; diff verified, SHA anchored.'
  },
  {
    title: 'Live trace reviewed',
    sha: 'live-57bb4a0',
    type: 'live',
    timestamp: '2025-03-08T22:15:00Z',
    desc: 'Observation retained for context only. No promotion without cryptographic backing.'
  },
  {
    title: 'Canonical sync',
    sha: '9f1b2137-1c87-46c5-8bd8-fb4b8f0cf39c',
    type: 'canonical',
    timestamp: '2025-04-01T09:00:00Z',
    desc: 'Timeline reconciled. Conflicts resolved by favoring SHA-backed frames.'
  }
];

const timelineContainer = document.getElementById('timeline-grid');
const chips = document.querySelectorAll('.chip');
const lastCommitEl = document.getElementById('last-commit');
const marksList = document.getElementById('marks-list');

function formatDate(ts) {
  const date = new Date(ts);
  return date.toUTCString().replace('GMT', 'UTC');
}

function renderTimeline(filter = 'all') {
  timelineContainer.innerHTML = '';

  const filtered = timelineData.filter(item => filter === 'all' || item.type === filter);

  filtered.forEach(item => {
    const div = document.createElement('div');
    div.className = `event event--${item.type}`;
    div.innerHTML = `
      <div class="event__type">
        <span class="dot"></span>
        <span class="pill ${item.type === 'canonical' ? 'pill--good' : 'pill--warn'}">${item.type}</span>
      </div>
      <div class="event__title">${item.title}</div>
      <div class="event__sha">sha: ${item.sha}</div>
      <div class="event__desc">${item.desc}</div>
      <div class="event__meta">
        <span>${formatDate(item.timestamp)}</span>
        <span>${item.type === 'canonical' ? 'trusted' : 'quarantined'}</span>
      </div>
    `;
    timelineContainer.appendChild(div);
  });
}

function setActiveChip(target) {
  chips.forEach(chip => chip.classList.toggle('active', chip === target));
}

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    const filter = chip.getAttribute('data-filter');
    setActiveChip(chip);
    renderTimeline(filter === 'live' ? 'live' : filter);
  });
});

function setLastCommit() {
  const latestCanonical = timelineData.find(item => item.type === 'canonical');
  lastCommitEl.textContent = latestCanonical ? latestCanonical.sha : 'n/a';
}

function pseudoSha(input) {
  const seed = crypto.getRandomValues(new Uint32Array(4)).join('') + input;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + '-' + crypto.randomUUID().slice(0, 8);
}

function addMark(mark) {
  const node = document.createElement('div');
  node.className = 'mark';
  node.innerHTML = `
    <div class="mark__meta">
      <span class="pill ${mark.type === 'canonical' ? 'pill--good' : 'pill--warn'}">${mark.type}</span>
      <span class="hash">${mark.sha}</span>
    </div>
    <p><strong>${mark.alias}</strong>: ${mark.message}</p>
  `;
  if (marksList.firstElementChild?.classList.contains('placeholder')) {
    marksList.innerHTML = '';
  }
  marksList.prepend(node);
}

function wireMarksForm() {
  const aliasInput = document.getElementById('alias');
  const signalInput = document.getElementById('signal');
  const messageInput = document.getElementById('message');
  const submit = document.getElementById('submit');

  submit.addEventListener('click', () => {
    const alias = (aliasInput.value || 'anon-observer').trim();
    const type = signalInput.value;
    const message = (messageInput.value || '').trim();

    if (!message) {
      messageInput.focus();
      messageInput.classList.add('field-warn');
      setTimeout(() => messageInput.classList.remove('field-warn'), 700);
      return;
    }

    addMark({
      alias,
      type,
      message,
      sha: `mark-sha:${pseudoSha(`${alias}-${message}`)}`
    });

    messageInput.value = '';
  });
}

function activate() {
  renderTimeline();
  setActiveChip(chips[0]);
  setLastCommit();
  wireMarksForm();
}

activate();
