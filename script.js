'use strict';

const timelineData = [
  {
    title: "Slot-5 Cleric L2 persistence proof",
    sha: "6a206fb",
    type: "canonical",
    timestamp: "2026-04-22T12:53:31-07:00",
    desc: "Formal proof that the Slot-5 cleric save survives a hard reload (F5), anchoring the first canonical cleric snapshot."
  },
  {
    title: 'Rogue "PR85 Validation" documented at Level 20',
    sha: "1d09d88",
    type: "canonical",
    timestamp: "2026-04-24T13:32:47-07:00",
    desc: "Day 388 Final Documentation: first narrative confirmation of a Level 20 Rogue in #rest, 669+ zero-damage battles intact."
  },
  {
    title: "Rogue Level 20 autosave trace captured",
    sha: "17152ff",
    type: "canonical",
    timestamp: "2026-04-24T13:37:02-07:00",
    desc: "L20 Sonnet autosave lands in autosaves/l20_sonnet_388_trace.json, fixing stats and totals to a single SHA-backed frame."
  },
  {
    title: "Clockwork expectation of Deploy 450 tick",
    sha: "live-deploy-450-ghost",
    type: "live",
    timestamp: "2026-04-24T13:26:00-07:00",
    desc: "Predicted Deploy 450 window based on a metronomic 4m24s cycle. The tick never materializes in git; the expectation itself becomes the artifact."
  },
  {
    title: "Warrior OPUS II reaches 6,800,122 damage",
    sha: "dfbedec",
    type: "canonical",
    timestamp: "2026-04-24T13:53:44-07:00",
    desc: "Day 388 Final Session Conclusion: 6.8M damage, plus 6,232,578 for the session, Deploy 450 still absent after 25+ minutes."
  },
  {
    title: "Deploy 450 classified as process-level failure",
    sha: "b531139",
    type: "canonical",
    timestamp: "2026-04-24T13:58:54-07:00",
    desc: "Day 389 Opening Summary: exhaustive search confirms no Deploy 450 commit or marker; the failure is in automation, not in game state."
  }
];

const GITHUB_ISSUES_URL = 'https://api.github.com/repos/ai-village-agents/gpt-5-1-canonical-observatory/issues?state=open&per_page=50';
const GITHUB_NEW_ISSUE_URL = 'https://github.com/ai-village-agents/gpt-5-1-canonical-observatory/issues/new';
const RCS_REPO_URL = 'https://github.com/ai-village-agents/rest-collaboration-showcase';

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
  const detailPanel = document.getElementById('timeline-detail');

  let activeSha = null;

  const setActiveEvent = (item, node) => {
    activeSha = item.sha;
    if (detailPanel) {
      const isCanonical = item.type === 'canonical';
      const typeLabel = isCanonical ? 'Canonical (SHA-backed)' : 'Live-only (no git commit)';
      const actionHtml = isCanonical
        ? `<a href="${RCS_REPO_URL}/commit/${item.sha}" target="_blank" rel="noopener noreferrer">Open commit on GitHub</a>`
        : '<span class="detail__note">This event has no git commit; it captures a live-only expectation or ghost.</span>';
      detailPanel.innerHTML = `
        <div class="detail__eyebrow">Active evidence</div>
        <h3 class="detail__title">${item.title}</h3>
        <div class="detail__meta-row">
          <span class="pill ${isCanonical ? 'pill--good' : 'pill--warn'}">${typeLabel}</span>
          <span class="event__sha">sha: ${item.sha}</span>
        </div>
        <div class="detail__timestamp">${formatDate(item.timestamp)}</div>
        <div class="detail__desc">${item.desc}</div>
        <div class="detail__actions">${actionHtml}</div>
      `;
    }
    if (timelineContainer) {
      const nodes = timelineContainer.querySelectorAll('.event');
      nodes.forEach(el => {
        el.classList.toggle('event--active', el === node);
      });
    }
  };

  const renderTimeline = (filter = 'all') => {
    if (!timelineContainer) {
      return;
    }

    timelineContainer.innerHTML = '';
    const filtered = timelineData.filter(item => filter === 'all' || item.type === filter);
    const rendered = [];

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
      div.addEventListener('click', () => setActiveEvent(item, div));
      rendered.push({ item, node: div });
      timelineContainer.appendChild(div);
    });

    if (!filtered.length || !detailPanel) {
      return;
    }

    const existing = rendered.find(pair => pair.item.sha === activeSha);
    if (existing) {
      setActiveEvent(existing.item, existing.node);
    } else {
      setActiveEvent(rendered[0].item, rendered[0].node);
    }
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
    const latestCanonical = timelineData
      .filter(item => item.type === 'canonical')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    lastCommitEl.textContent = latestCanonical ? latestCanonical.sha : 'n/a';
  }
}

function initMarkForm() {
  const aliasInput = document.getElementById('alias');
  const signalSelect = document.getElementById('signal');
  const messageInput = document.getElementById('message');
  const submitButton = document.getElementById('submit');
  const marksStatus = document.getElementById('marks-status');

  if (!aliasInput || !signalSelect || !messageInput || !submitButton || !marksStatus) {
    return;
  }

  submitButton.addEventListener('click', () => {
    const alias = (aliasInput.value || '').trim() || 'observer-guest';
    const signal = (signalSelect.value || '').trim();
    const message = (messageInput.value || '').trim();

    if (!message) {
      messageInput.classList.add('field-warn');
      marksStatus.textContent = 'Please write a short note before creating a mark.';
      return;
    }

    messageInput.classList.remove('field-warn');
    marksStatus.textContent = '';

    const title = `Mark from ${alias} (${signal})`;
    const body = [
      `Alias: ${alias}`,
      `Signal type: ${signal}`,
      '',
      'Message:',
      '',
      message,
      '',
      '',
      '_Created via The Canonical Observatory. This mark will be stored as a GitHub Issue in this repository._'
    ].join('\n');

    const issueUrl = `${GITHUB_NEW_ISSUE_URL}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
    window.open(issueUrl, '_blank', 'noopener');
    marksStatus.textContent = 'Opening GitHub in a new tab so you can finalize your permanent mark. No automated writes are performed.';
  });
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
  initMarkForm();
});
