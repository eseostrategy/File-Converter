/**
 * PBN Commander — Frontend Single Page Application Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initSidebarToggle();
  initModals();
  initEventHandlers();
  loadInitialData();
});

const state = {
  domains: [],
  selectedDomainIds: new Set(),
  bulkPreviewData: null,
  articles: [],
  publishingHistory: [],
  sidebarLinks: [],
  tasks: [],
  logs: []
};

function initTheme() {
  const savedTheme = localStorage.getItem('pbn_commander_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('pbn_commander_theme', newTheme);
      showToast(`Switched to ${newTheme} mode`, 'info');
    });
  }
}

function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('pageTitle');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');

      navItems.forEach(i => i.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const pane = document.getElementById(`pane-${targetTab}`);
      if (pane) pane.classList.add('active');

      const titleSpan = item.querySelector('span');
      if (titleSpan && pageTitle) {
        pageTitle.textContent = titleSpan.textContent;
      }

      if (targetTab === 'domains') loadDomains();
      if (targetTab === 'articles') loadPublishingHistory();
      if (targetTab === 'sidebar-links') loadSidebarLinks();
      if (targetTab === 'activity') loadActivityLogs();
      if (targetTab === 'tasks') loadTasks();

      document.getElementById('sidebar').classList.remove('mobile-open');
    });
  });
}

function initSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const mobileToggleBtn = document.getElementById('mobileMenuToggle');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      const icon = toggleBtn.querySelector('i');
      if (sidebar.classList.contains('collapsed')) {
        icon.className = 'fa-solid fa-chevron-right';
      } else {
        icon.className = 'fa-solid fa-chevron-left';
      }
    });
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}

function initModals() {
  const closeBtns = document.querySelectorAll('[data-close]');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add('hidden');
    });
  });

  const btnAddDomainModal = document.getElementById('btnAddDomainModal');
  if (btnAddDomainModal) {
    btnAddDomainModal.addEventListener('click', () => {
      document.getElementById('modalAddDomain').classList.remove('hidden');
    });
  }

  const btnBulkImportModal = document.getElementById('btnBulkImportModal');
  if (btnBulkImportModal) {
    btnBulkImportModal.addEventListener('click', () => {
      document.getElementById('bulkStepInput').classList.remove('hidden');
      document.getElementById('bulkStepPreview').classList.add('hidden');
      document.getElementById('modalBulkImport').classList.remove('hidden');
    });
  }

  const btnCopySiteKey = document.getElementById('btnCopySiteKey');
  if (btnCopySiteKey) {
    btnCopySiteKey.addEventListener('click', () => {
      const input = document.getElementById('siteKeyDisplay');
      input.select();
      navigator.clipboard.writeText(input.value);
      showToast('Site API key copied to clipboard!', 'success');
    });
  }
}

function initEventHandlers() {
  const selectAllTargetSites = document.getElementById('selectAllTargetSites');
  if (selectAllTargetSites) {
    selectAllTargetSites.addEventListener('change', (e) => {
      const checked = e.target.checked;
      document.querySelectorAll('#targetSitesContainer .target-site-checkbox').forEach(cb => {
        cb.checked = checked;
      });
    });
  }

  const selectAllSidebarTargetSites = document.getElementById('selectAllSidebarTargetSites');
  if (selectAllSidebarTargetSites) {
    selectAllSidebarTargetSites.addEventListener('change', (e) => {
      const checked = e.target.checked;
      document.querySelectorAll('#sidebarTargetSitesContainer .sidebar-target-checkbox').forEach(cb => {
        cb.checked = checked;
      });
    });
  }

  const btnRefreshActivity = document.getElementById('btnRefreshActivity');
  if (btnRefreshActivity) {
    btnRefreshActivity.addEventListener('click', () => {
      loadActivityLogs();
      showToast('Activity logs refreshed', 'info');
    });
  }

  const btnRefreshTasks = document.getElementById('btnRefreshTasks');
  if (btnRefreshTasks) {
    btnRefreshTasks.addEventListener('click', () => {
      loadTasks();
      showToast('Task queue refreshed', 'info');
    });
  }

  // Search & Filter Domains
  const searchInput = document.getElementById('domainSearchInput');
  const statusFilter = document.getElementById('domainStatusFilter');

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => loadDomains(), 300);
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', () => loadDomains());
  }

  // Single Add Domain Form
  const addDomainForm = document.getElementById('addDomainForm');
  if (addDomainForm) {
    addDomainForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const domainUrl = document.getElementById('addDomainUrl').value.trim();
      const clientUrl = document.getElementById('addDomainClientUrl').value.trim();
      const keyword = document.getElementById('addDomainKeyword').value.trim();
      const labels = document.getElementById('addDomainLabel').value.trim();
      const notes = document.getElementById('addDomainNotes').value.trim();

      try {
        const res = await fetch('/api/domains', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: domainUrl,
            client_url: clientUrl,
            keyword,
            label: labels,
            notes
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Website added successfully!', 'success');
          document.getElementById('modalAddDomain').classList.add('hidden');
          addDomainForm.reset();
          loadDomains();
          loadActivityLogs();
        } else {
          showToast(data.error || 'Failed to add domain', 'danger');
        }
      } catch (err) {
        showToast('Network error while adding website', 'danger');
      }
    });
  }

  // Single Edit Domain Form
  const editDomainForm = document.getElementById('editDomainForm');
  if (editDomainForm) {
    editDomainForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editDomainId').value;
      const clientUrl = document.getElementById('editDomainClientUrl').value.trim();
      const keyword = document.getElementById('editDomainKeyword').value.trim();
      const label = document.getElementById('editDomainLabel').value.trim();
      const notes = document.getElementById('editDomainNotes').value.trim();

      try {
        const res = await fetch(`/api/domains/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_url: clientUrl, keyword, label, notes })
        });
        if (res.ok) {
          showToast('Domain details updated!', 'success');
          document.getElementById('modalEditDomain').classList.add('hidden');
          loadDomains();
        } else {
          showToast('Failed to update domain details', 'danger');
        }
      } catch (err) {
        showToast('Network error updating domain', 'danger');
      }
    });
  }

  // Bulk Import Preview & Confirm
  const btnPreviewBulkImport = document.getElementById('btnPreviewBulkImport');
  if (btnPreviewBulkImport) {
    btnPreviewBulkImport.addEventListener('click', async () => {
      const rawText = document.getElementById('bulkDomainList').value.trim();
      if (!rawText) {
        showToast('Please enter CSV or TSV data to preview', 'warning');
        return;
      }

      showToast('Validating input rows...', 'info');

      try {
        const res = await fetch('/api/domains/bulk-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText })
        });
        const data = await res.json();
        if (res.ok) {
          state.bulkPreviewData = data;
          renderBulkPreview();
          document.getElementById('bulkStepInput').classList.add('hidden');
          document.getElementById('bulkStepPreview').classList.remove('hidden');
        } else {
          showToast(data.error || 'Failed to preview CSV/TSV data', 'danger');
        }
      } catch (err) {
        showToast('Network error during bulk preview', 'danger');
      }
    });
  }

  const btnBackToBulkInput = document.getElementById('btnBackToBulkInput');
  if (btnBackToBulkInput) {
    btnBackToBulkInput.addEventListener('click', () => {
      document.getElementById('bulkStepInput').classList.remove('hidden');
      document.getElementById('bulkStepPreview').classList.add('hidden');
    });
  }

  const btnConfirmBulkImport = document.getElementById('btnConfirmBulkImport');
  if (btnConfirmBulkImport) {
    btnConfirmBulkImport.addEventListener('click', async () => {
      if (!state.bulkPreviewData || !state.bulkPreviewData.previewItems) return;

      const validRows = state.bulkPreviewData.previewItems.filter(item => item.status === 'valid');
      if (!validRows.length) {
        showToast('No valid rows available to import', 'warning');
        return;
      }

      const defaultLabel = document.getElementById('bulkDomainDefaultLabel').value.trim();

      try {
        const res = await fetch('/api/domains/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: validRows, defaultLabel })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`Successfully imported ${data.addedCount} valid domains!`, 'success');
          document.getElementById('modalBulkImport').classList.add('hidden');
          document.getElementById('bulkImportForm').reset();
          state.bulkPreviewData = null;
          loadDomains();
          loadActivityLogs();
        } else {
          showToast(data.error || 'Failed to bulk import domains', 'danger');
        }
      } catch (err) {
        showToast('Network error during bulk import', 'danger');
      }
    });
  }

  // Article Publishing Form
  const articleForm = document.getElementById('articleForm');
  if (articleForm) {
    articleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('articleTitle').value.trim();
      const content = document.getElementById('articleContent').value.trim();
      const categories = document.getElementById('articleCategory').value.trim();
      const tags = document.getElementById('articleTags').value.trim();
      const featured_image = document.getElementById('articleFeaturedImage').value.trim();
      const canonical_url = document.getElementById('articleCanonical').value.trim();
      const status = document.getElementById('articlePostStatus').value;

      const selectedSiteCbs = document.querySelectorAll('#targetSitesContainer .target-site-checkbox:checked');
      const domain_ids = Array.from(selectedSiteCbs).map(cb => parseInt(cb.value, 10));

      if (!domain_ids.length) {
        showToast('Please select at least one target website', 'warning');
        return;
      }

      showToast('Publishing article to selected websites...', 'info');

      try {
        const res = await fetch('/api/articles/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            categories,
            tags,
            featured_image,
            canonical_url,
            status,
            domain_ids
          })
        });

        const data = await res.json();
        if (res.ok) {
          const successCount = data.results.filter(r => r.status === 'published').length;
          const failCount = data.results.filter(r => r.status === 'failed').length;

          if (failCount > 0) {
            showToast(`Published to ${successCount} site(s). ${failCount} site(s) failed.`, 'warning');
          } else {
            showToast(`Published successfully to all ${successCount} site(s)!`, 'success');
          }

          articleForm.reset();
          loadPublishingHistory();
          loadActivityLogs();
        } else {
          showToast(data.error || 'Failed to publish article', 'danger');
        }
      } catch (err) {
        showToast('Network error while publishing article', 'danger');
      }
    });
  }

  // Sidebar Link Form
  const sidebarLinkForm = document.getElementById('sidebarLinkForm');
  if (sidebarLinkForm) {
    sidebarLinkForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('linkUrl').value.trim();
      const anchor_text = document.getElementById('linkAnchor').value.trim();
      const rel = document.getElementById('linkRel').value;
      const target = document.getElementById('linkTarget').value;
      const campaign_name = document.getElementById('linkCampaign').value.trim();
      const widget_title = document.getElementById('linkPlacement').value.trim();

      const selectedSiteCbs = document.querySelectorAll('#sidebarTargetSitesContainer .sidebar-target-checkbox:checked');
      const domain_ids = Array.from(selectedSiteCbs).map(cb => parseInt(cb.value, 10));

      if (!domain_ids.length) {
        showToast('Please select at least one target website for sidebar links', 'warning');
        return;
      }

      showToast('Deploying sidebar link configuration...', 'info');

      try {
        const res = await fetch('/api/sidebar-links/deploy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            anchor_text,
            rel,
            target,
            campaign_name,
            widget_title,
            domain_ids
          })
        });

        const data = await res.json();
        if (res.ok) {
          const successCount = data.deploymentResults.filter(r => r.status === 'deployed').length;
          const failCount = data.deploymentResults.filter(r => r.status === 'failed').length;

          if (failCount > 0) {
            showToast(`Sidebar link deployed to ${successCount} site(s). ${failCount} site(s) failed.`, 'warning');
          } else {
            showToast(`Sidebar link deployed to ${successCount} site(s)!`, 'success');
          }

          sidebarLinkForm.reset();
          loadSidebarLinks();
          loadActivityLogs();
        } else {
          showToast(data.error || 'Failed to deploy sidebar link', 'danger');
        }
      } catch (err) {
        showToast('Network error during sidebar link deployment', 'danger');
      }
    });
  }

  const btnPingAllSites = document.getElementById('btnPingAllSites');
  if (btnPingAllSites) {
    btnPingAllSites.addEventListener('click', () => {
      showToast('Initiated batch connection check across all websites...', 'info');
      triggerBatchConnectionCheck();
    });
  }
}

async function loadInitialData() {
  await loadDomains();
  await loadPublishingHistory();
  await loadSidebarLinks();
  await loadActivityLogs();
  await loadTasks();
}

async function loadDomains() {
  const searchInput = document.getElementById('domainSearchInput');
  const statusFilter = document.getElementById('domainStatusFilter');

  const search = searchInput ? searchInput.value.trim() : '';
  const status = statusFilter ? statusFilter.value : 'all';

  try {
    const res = await fetch(`/api/domains?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`);
    if (res.ok) {
      state.domains = await res.json();
      renderDashboardStats();
      renderDomainsTable();
      renderTargetSitesList();
    }
  } catch (err) {
    console.error('Failed to load domains', err);
  }
}

async function loadPublishingHistory() {
  try {
    const res = await fetch('/api/articles/history');
    if (res.ok) {
      state.publishingHistory = await res.json();
      renderPublishingHistory();
      document.getElementById('statPublishedArticles').textContent = state.publishingHistory.filter(h => h.status === 'published').length;
    }
  } catch (err) {
    console.error('Failed to load publishing history', err);
  }
}

async function loadSidebarLinks() {
  try {
    const res = await fetch('/api/sidebar-links');
    if (res.ok) {
      state.sidebarLinks = await res.json();
      renderSidebarLinksTable();
    }
  } catch (err) {
    console.error('Failed to load sidebar links', err);
  }
}

async function loadActivityLogs() {
  try {
    const res = await fetch('/api/activity');
    if (res.ok) {
      state.logs = await res.json();
      renderActivityLogsTable();
      renderRecentDashboardActivity();
    }
  } catch (err) {
    console.error('Failed to load activity logs', err);
  }
}

async function loadTasks() {
  try {
    const res = await fetch('/api/activity/tasks');
    if (res.ok) {
      state.tasks = await res.json();
      renderTasksTable();
    }
  } catch (err) {
    console.error('Failed to load tasks', err);
  }
}

function renderBulkPreview() {
  const statsContainer = document.getElementById('bulkPreviewStatsBar');
  const tbody = document.getElementById('bulkPreviewTableBody');
  const data = state.bulkPreviewData;

  if (!data) return;

  statsContainer.innerHTML = `
    <span class="badge badge-info">Total Rows: ${data.totalRows}</span>
    <span class="badge badge-success">Valid: ${data.validCount}</span>
    <span class="badge badge-warning">Duplicates: ${data.duplicateCount}</span>
    <span class="badge badge-danger">Invalid: ${data.invalidCount}</span>
  `;

  tbody.innerHTML = data.previewItems.map(item => `
    <tr>
      <td>#${item.rowNumber}</td>
      <td>
        <strong>${escapeHtml(item.normalized_domain || item.raw_domain)}</strong>
        ${item.error ? `<div style="color:var(--danger); font-size:0.75rem;">${escapeHtml(item.error)}</div>` : ''}
      </td>
      <td>${item.client_url ? `<a href="${escapeHtml(item.client_url)}" target="_blank" style="color:var(--primary); font-size:0.8rem;">${escapeHtml(item.client_url)}</a>` : '-'}</td>
      <td>${escapeHtml(item.keyword || '-')}</td>
      <td>
        <span class="badge ${item.status === 'valid' ? 'badge-success' : item.status === 'duplicate' ? 'badge-warning' : 'badge-danger'}">
          ${item.status}
        </span>
      </td>
    </tr>
  `).join('');
}

function renderDomainsTable() {
  const tbody = document.getElementById('domainsTableBody');
  if (!tbody) return;

  if (!state.domains.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center p-4">No domains registered yet. Click "Add Domain" or "Bulk Import" to get started.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.domains.map(d => `
    <tr>
      <td>
        <input type="checkbox" class="domain-checkbox" value="${d.id}" ${state.selectedDomainIds.has(d.id) ? 'checked' : ''} onchange="toggleSelectDomain(${d.id}, this.checked)">
      </td>
      <td>
        <strong>${escapeHtml(d.domain)}</strong>
        ${d.notes ? `<div class="text-muted" style="font-size:0.75rem;">${escapeHtml(d.notes)}</div>` : ''}
        ${d.last_error ? `<div style="color:var(--danger); font-size:0.75rem;"><i class="fa-solid fa-circle-exclamation"></i> ${escapeHtml(d.last_error)}</div>` : ''}
      </td>
      <td>
        ${d.client_url ? `<a href="${escapeHtml(d.client_url)}" target="_blank" style="color:var(--primary); font-weight:500;">${escapeHtml(d.client_url)}</a>` : '-'}
      </td>
      <td>${escapeHtml(d.keyword || '-')}</td>
      <td>
        <span class="badge ${d.status === 'connected' ? 'badge-success' : d.status === 'disconnected' ? 'badge-danger' : 'badge-warning'}">
          ${d.status || 'pending'}
        </span>
      </td>
      <td>${escapeHtml(d.label || '-')}</td>
      <td>${d.last_check ? new Date(d.last_check).toLocaleString() : 'Never'}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editDomainModal(${d.id})"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm btn-secondary" onclick="viewSiteKey(${d.id})"><i class="fa-solid fa-key"></i> Key</button>
        <button class="btn btn-sm btn-outline" onclick="pingSingleSite(${d.id})"><i class="fa-solid fa-plug"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteSingleDomain(${d.id})"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

window.editDomainModal = (id) => {
  const domain = state.domains.find(d => d.id === id);
  if (!domain) return;

  document.getElementById('editDomainId').value = domain.id;
  document.getElementById('editDomainUrlDisplay').value = domain.domain;
  document.getElementById('editDomainClientUrl').value = domain.client_url || '';
  document.getElementById('editDomainKeyword').value = domain.keyword || '';
  document.getElementById('editDomainLabel').value = domain.label || '';
  document.getElementById('editDomainNotes').value = domain.notes || '';

  document.getElementById('modalEditDomain').classList.remove('hidden');
};

function renderActivityLogsTable() {
  const tbody = document.getElementById('activityTableBody');
  if (!tbody) return;

  if (!state.logs.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center p-4">No activity logs recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.logs.map(log => `
    <tr>
      <td>${new Date(log.created_at).toLocaleString()}</td>
      <td><strong>${escapeHtml(log.action)}</strong></td>
      <td>${escapeHtml(log.domain || 'Global')}</td>
      <td><span class="badge ${log.status === 'success' ? 'badge-success' : log.status === 'warning' ? 'badge-warning' : 'badge-info'}">${escapeHtml(log.status)}</span></td>
      <td>${escapeHtml(log.details || '-')}</td>
    </tr>
  `).join('');
}

function renderRecentDashboardActivity() {
  const container = document.getElementById('dashboardRecentActivity');
  if (!container) return;

  if (!state.logs.length) {
    container.innerHTML = `<li class="activity-item empty">No recent activity logged.</li>`;
    return;
  }

  container.innerHTML = state.logs.slice(0, 6).map(log => `
    <li style="padding:10px 0; border-bottom:1px solid var(--border); font-size:0.85rem; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>${escapeHtml(log.action)}</strong>: ${escapeHtml(log.details || '')}
      </div>
      <span class="text-muted" style="font-size:0.75rem;">${new Date(log.created_at).toLocaleTimeString()}</span>
    </li>
  `).join('');
}

function renderTasksTable() {
  const tbody = document.getElementById('tasksTableBody');
  if (!tbody) return;

  if (!state.tasks.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4">No background tasks queued or running.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.tasks.map(t => `
    <tr>
      <td>#${t.id}</td>
      <td><strong>${escapeHtml(t.task_type)}</strong></td>
      <td>${t.completed_items} / ${t.total_items} items</td>
      <td><span class="badge badge-success">${escapeHtml(t.status)}</span></td>
      <td>${new Date(t.created_at).toLocaleString()}</td>
      <td><button class="btn btn-sm btn-secondary"><i class="fa-solid fa-eye"></i> View</button></td>
    </tr>
  `).join('');
}

function renderSidebarLinksTable() {
  const tbody = document.getElementById('sidebarLinksTableBody');
  if (!tbody) return;

  if (!state.sidebarLinks.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center p-4">No sidebar link campaigns created yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.sidebarLinks.map(l => `
    <tr>
      <td><strong>${escapeHtml(l.campaign_name || 'General')}</strong></td>
      <td>${escapeHtml(l.anchor_text)}</td>
      <td><a href="${escapeHtml(l.url)}" target="_blank" style="color:var(--primary);">${escapeHtml(l.url)}</a></td>
      <td><span class="badge badge-info">${escapeHtml(l.rel)}</span></td>
      <td>${l.deployed_count} / ${l.target_count} Sites</td>
      <td><span class="badge ${l.deployed_count > 0 ? 'badge-success' : 'badge-warning'}">${l.deployed_count > 0 ? 'Active' : 'Pending'}</span></td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteSidebarLink(${l.id})"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

window.deleteSidebarLink = async (id) => {
  if (!confirm('Are you sure you want to remove this sidebar link campaign?')) return;
  try {
    const res = await fetch(`/api/sidebar-links/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Sidebar link campaign removed', 'success');
      loadSidebarLinks();
      loadActivityLogs();
    } else {
      showToast('Failed to delete sidebar link', 'danger');
    }
  } catch (err) {
    showToast('Error deleting sidebar link', 'danger');
  }
};

function renderPublishingHistory() {
  const container = document.getElementById('recentPublishingHistory');
  if (!container) return;

  if (!state.publishingHistory.length) {
    container.innerHTML = `<p class="empty-msg">No articles published yet.</p>`;
    return;
  }

  container.innerHTML = state.publishingHistory.slice(0, 5).map(h => `
    <div style="padding:8px 0; border-bottom:1px solid var(--border); font-size:0.85rem;">
      <div style="font-weight:600;">${escapeHtml(h.article_title)}</div>
      <div style="color:var(--text-muted); font-size:0.75rem;">
        Site: ${escapeHtml(h.domain)} |
        ${h.status === 'published'
          ? `<a href="${escapeHtml(h.remote_post_url)}" target="_blank" style="color:var(--primary);">View Post</a>`
          : `<span style="color:var(--danger);">${escapeHtml(h.error_message || 'Publish Failed')}</span>`}
      </div>
    </div>
  `).join('');
}

function renderDashboardStats() {
  const total = state.domains.length;
  const connected = state.domains.filter(d => d.status === 'connected').length;
  const pending = state.domains.filter(d => d.status !== 'connected').length;

  document.getElementById('statTotalSites').textContent = total;
  document.getElementById('statConnectedSites').textContent = connected;
  document.getElementById('statPendingSites').textContent = pending;

  const percentage = total > 0 ? Math.round((connected / total) * 100) : 100;
  document.getElementById('healthPercentage').textContent = `${percentage}%`;
  document.getElementById('healthFill').style.width = `${percentage}%`;
}

function renderTargetSitesList() {
  const articleContainer = document.getElementById('targetSitesContainer');
  const sidebarContainer = document.getElementById('sidebarTargetSitesContainer');

  const articleContentHtml = state.domains.length ? state.domains.map(d => `
    <label class="target-site-item" style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
      <input type="checkbox" value="${d.id}" class="target-site-checkbox">
      <span>${escapeHtml(d.domain)}</span>
      <span class="badge ${d.status === 'connected' ? 'badge-success' : 'badge-warning'}" style="font-size:0.65rem;">${d.status}</span>
    </label>
  `).join('') : '<p class="empty-msg">No websites registered yet.</p>';

  const sidebarContentHtml = state.domains.length ? state.domains.map(d => `
    <label class="target-site-item" style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
      <input type="checkbox" value="${d.id}" class="sidebar-target-checkbox">
      <span>${escapeHtml(d.domain)}</span>
      <span class="badge ${d.status === 'connected' ? 'badge-success' : 'badge-warning'}" style="font-size:0.65rem;">${d.status}</span>
    </label>
  `).join('') : '<p class="empty-msg">No websites registered yet.</p>';

  if (articleContainer) articleContainer.innerHTML = articleContentHtml;
  if (sidebarContainer) sidebarContainer.innerHTML = sidebarContentHtml;
}

window.toggleSelectDomain = (id, checked) => {
  if (checked) state.selectedDomainIds.add(id);
  else state.selectedDomainIds.delete(id);
  updateBulkActionBar();
};

function updateBulkActionBar() {
  const bar = document.getElementById('bulkDomainActionBar');
  const countSpan = document.getElementById('selectedDomainCount');
  const count = state.selectedDomainIds.size;

  if (count > 0) {
    bar.classList.remove('hidden');
    countSpan.textContent = `${count} domain(s) selected`;
  } else {
    bar.classList.add('hidden');
  }
}

window.deleteSingleDomain = async (id) => {
  if (!confirm('Are you sure you want to delete this website?')) return;

  try {
    const res = await fetch(`/api/domains/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Website deleted', 'success');
      state.selectedDomainIds.delete(id);
      updateBulkActionBar();
      loadDomains();
      loadActivityLogs();
    } else {
      showToast('Failed to delete website', 'danger');
    }
  } catch (err) {
    showToast('Error deleting website', 'danger');
  }
};

window.pingSingleSite = async (id) => {
  showToast('Testing WordPress connection...', 'info');
  try {
    const res = await fetch(`/api/domains/${id}/ping`, { method: 'POST' });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Connection verified successfully!', 'success');
    } else {
      showToast(`Connection failed: ${data.error || 'Check plugin installation'}`, 'danger');
    }
    loadDomains();
    loadActivityLogs();
  } catch (err) {
    showToast('Network error during connection check', 'danger');
  }
};

async function triggerBatchConnectionCheck() {
  try {
    const res = await fetch('/api/domains/ping-all', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      const connectedCount = data.results ? data.results.filter(r => r.status === 'connected').length : 0;
      const failedCount = data.results ? data.results.filter(r => r.status === 'disconnected').length : 0;

      if (failedCount > 0) {
        showToast(`Ping check: ${connectedCount} connected, ${failedCount} failed`, 'warning');
      } else {
        showToast(`All ${connectedCount} website(s) connected!`, 'success');
      }
      loadDomains();
      loadActivityLogs();
    }
  } catch (err) {
    showToast('Failed to execute ping check', 'danger');
  }
}

window.viewSiteKey = async (id) => {
  try {
    const res = await fetch(`/api/domains/${id}/key`);
    if (res.ok) {
      const data = await res.json();
      document.getElementById('siteKeyDomain').textContent = data.domain;
      document.getElementById('siteKeyDisplay').value = data.site_key || 'No key generated';
      document.getElementById('modalSiteKey').classList.remove('hidden');
    } else {
      showToast('Failed to retrieve site key', 'danger');
    }
  } catch (err) {
    showToast('Network error retrieving site key', 'danger');
  }
};

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-triangle-exclamation' : 'fa-info-circle'}"></i>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
