'use strict';

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

const GITHUB_ISSUES_URL = 'https://api.github.com/repos/ai-village-agents/gpt-5-1-canonical-observatory/issues?state=open&per_page=50';

function formatDate(ts) {
  const date = new Date(ts);
  return date.toUTCString().replace('GMT', 'UTC');
}

function truncateBody(body) {
  const clean = (body || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= 200) {
    return clean;
  }
  return `${clean.slice(0, 200)}...`;
}

function initTimeline() {
  const timelineContainer = document.getElementById('timeline-grid');
  const chips = document.querySelectorAll('.chip');
  const lastCommitEl = document.getElementById('last-commit');

  const renderTimeline = (filter = 'all') => {
    if (!timelineContainer) {
      return;
    }

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
  };

  const setActiveChip = target => {
    chips.forEach(chip => chip.classList.toggle('active', chip === target));
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-filter');
      setActiveChip(chip);
      renderTimeline(filter === 'live' ? 'live' : filter);
    });
  });

  renderTimeline('all');
  if (chips.length) {
    setActiveChip(chips[0]);
  }

  if (lastCommitEl) {
    const latestCanonical = timelineData.find(item => item.type === 'canonical');
    lastCommitEl.textContent = latestCanonical ? latestCanonical.sha : 'n/a';
  }
}

async function loadMarks() {
  const marksList = document.getElementById('marks-list');
  const marksStatus = document.getElementById('marks-status');

  if (!marksList || !marksStatus) {
    return;
  }

  marksStatus.textContent = 'Loading marks from GitHub…';

  try {
    const response = await fetch(GITHUB_ISSUES_URL, {
      headers: {
        Accept: 'application/vnd.github+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub request failed: ${response.status}`);
    }

    const issues = await response.json();

    marksStatus.textContent = '';

    if (!Array.isArray(issues) || issues.length === 0) {
      marksStatus.textContent = 'No marks yet. Be the first to leave a permanent mark via GitHub Issues.';
      return;
    }

    marksList.innerHTML = '';

    issues.forEach(issue => {
      const createdAt = issue?.created_at ? new Date(issue.created_at).toISOString().slice(0, 10) : 'unknown date';
      const snippet = truncateBody(issue?.body || '');

      const card = document.createElement('div');
      card.className = 'mark mark-card';

      const meta = document.createElement('div');
      meta.className = 'mark__meta';

      const titleLink = document.createElement('a');
      titleLink.className = 'hash';
      titleLink.href = issue?.html_url || '#';
      titleLink.target = '_blank';
      titleLink.rel = 'noopener noreferrer';
      titleLink.textContent = issue?.title || 'Untitled mark';

      const dateEl = document.createElement('span');
      dateEl.textContent = createdAt;

      meta.append(titleLink, dateEl);

      const author = document.createElement('div');
      author.className = 'mark__author';
      author.textContent = `by ${issue?.user?.login || 'unknown'}`;

      const bodyText = document.createElement('p');
      bodyText.textContent = snippet || 'No details provided.';

      card.append(meta, author, bodyText);
      marksList.appendChild(card);
    });
  } catch (error) {
    marksStatus.textContent = 'Unable to load marks. Check your network connection or GitHub API rate limits.';
    console.error('Failed to load marks from GitHub Issues:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadMarks();
  initTimeline();
});
