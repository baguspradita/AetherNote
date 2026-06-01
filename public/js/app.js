// ==========================================================================
// AETHERNOTE — FRONTEND JAVASCRIPT APPLICATION LOGIC
// ==========================================================================

const API_BASE = '/api';

// Application State
let state = {
  token: localStorage.getItem('aethernote_token') || null,
  user: JSON.parse(localStorage.getItem('aethernote_user')) || null,
  notes: [],
  currentCategoryFilter: 'Semua',
  searchQuery: ''
};

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const userAvatar = document.getElementById('user-avatar');
const notesGrid = document.getElementById('notes-grid');
const notesLoading = document.getElementById('notes-loading');
const notesEmpty = document.getElementById('notes-empty');
const editModal = document.getElementById('edit-modal');

// Toast Notification Helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'check-circle';
  if (type === 'danger') iconName = 'alert-triangle';
  if (type === 'info') iconName = 'info';

  toast.innerHTML = `
    <i data-lucide="${iconName}" class="toast-icon"></i>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  // Slide out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// Convert Hex to RGB Helper for Note Glow Color
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : '139, 92, 246';
}

// Switch between Auth Tabs
function switchAuthTab(tab) {
  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
  }
}

// Initialize Application
async function initApp() {
  lucide.createIcons();

  // Manage setup of radio color pickers active class
  setupColorPickers();

  if (state.token) {
    // Attempt to verify token with backend
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      
      const result = await response.json();
      
      if (result.success) {
        state.user = result.user;
        localStorage.setItem('aethernote_user', JSON.stringify(result.user));
        showDashboard();
      } else {
        // Token is invalid/expired
        handleLogout(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Backend might be offline or loading, proceed with cached user details if available
      if (state.user) {
        showDashboard();
        showToast('Bekerja dalam mode offline / server lambat', 'info');
      } else {
        handleLogout(false);
      }
    }
  } else {
    showAuthScreen();
  }
}

// Setup Accent Color Pickers Click Listeners
function setupColorPickers() {
  const options = document.querySelectorAll('.color-option');
  options.forEach(option => {
    const input = option.querySelector('input');
    input.addEventListener('change', () => {
      // Clear sibling active classes in same group
      const siblings = option.parentNode.querySelectorAll('.color-option');
      siblings.forEach(sib => sib.classList.remove('active'));
      option.classList.add('active');
    });
  });
}

// Show/Hide Screens
function showDashboard() {
  authScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
  
  // Render user profile info
  if (state.user) {
    profileName.textContent = state.user.name;
    profileEmail.textContent = state.user.email;
    userAvatar.textContent = state.user.name.charAt(0).toUpperCase();
  }

  fetchNotes();
}

function showAuthScreen() {
  authScreen.classList.remove('hidden');
  dashboardScreen.classList.add('hidden');
}

// ==========================================
// AUTH FLOW
// ==========================================

// Register
async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const submitBtn = document.getElementById('btn-register-submit');

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Mendaftarkan Akun...';

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const result = await response.json();

    if (result.success) {
      state.token = result.token;
      state.user = result.user;
      localStorage.setItem('aethernote_token', result.token);
      localStorage.setItem('aethernote_user', JSON.stringify(result.user));
      
      showToast(`Selamat datang, ${result.user.name}! Akun berhasil dibuat.`, 'success');
      showDashboard();
      registerForm.reset();
    } else {
      showToast(result.message || 'Gagal mendaftar akun.', 'danger');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showToast('Terjadi kesalahan koneksi server.', 'danger');
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Buat Akun Gratis';
  }
}

// Login
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const submitBtn = document.getElementById('btn-login-submit');

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Menghubungkan...';

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (result.success) {
      state.token = result.token;
      state.user = result.user;
      localStorage.setItem('aethernote_token', result.token);
      localStorage.setItem('aethernote_user', JSON.stringify(result.user));

      showToast(`Senang melihat Anda kembali, ${result.user.name}!`, 'success');
      showDashboard();
      loginForm.reset();
    } else {
      showToast(result.message || 'Login gagal. Periksa kembali email dan password.', 'danger');
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Gagal terhubung dengan server.', 'danger');
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Masuk ke Workspace';
  }
}

// Logout
function handleLogout(notify = true) {
  state.token = null;
  state.user = null;
  state.notes = [];
  localStorage.removeItem('aethernote_token');
  localStorage.removeItem('aethernote_user');

  showAuthScreen();
  if (notify) showToast('Anda telah berhasil keluar dari workspace.', 'info');
}

// ==========================================
// NOTES CRUD FLOW
// ==========================================

// Get All Notes
async function fetchNotes() {
  notesLoading.classList.remove('hidden');
  notesGrid.querySelectorAll('.note-card').forEach(card => card.remove());
  notesEmpty.classList.add('hidden');

  try {
    const response = await fetch(`${API_BASE}/notes`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const result = await response.json();

    if (result.success) {
      state.notes = result.notes;
      renderNotes();
    } else {
      showToast(result.message || 'Gagal mengambil data catatan.', 'danger');
    }
  } catch (error) {
    console.error('Fetch notes error:', error);
    showToast('Gagal memuat catatan dari server.', 'danger');
  } finally {
    notesLoading.classList.add('hidden');
  }
}

// Create Note
async function handleCreateNote(event) {
  event.preventDefault();
  
  const title = document.getElementById('note-title').value;
  const category = document.getElementById('note-category').value;
  const content = document.getElementById('note-content').value;
  const isPinned = document.getElementById('note-pinned').checked;
  
  const colorInput = document.querySelector('input[name="note-color"]:checked');
  const color = colorInput ? colorInput.value : '#8B5CF6';
  
  // Parse tags from input (comma separated)
  const tagsInput = document.getElementById('note-tags').value;
  const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

  try {
    const response = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ title, content, category, color, tags, isPinned })
    });

    const result = await response.json();

    if (result.success) {
      showToast('Catatan berhasil disimpan!', 'success');
      document.getElementById('note-form').reset();
      
      // Reset color pickers styling to default first item
      document.querySelectorAll('.color-picker-group .color-option').forEach((opt, idx) => {
        if (idx === 0) {
          opt.classList.add('active');
          opt.querySelector('input').checked = true;
        } else {
          opt.classList.remove('active');
        }
      });

      // Refresh list
      fetchNotes();
    } else {
      showToast(result.message || 'Gagal menyimpan catatan.', 'danger');
    }
  } catch (error) {
    console.error('Create note error:', error);
    showToast('Koneksi server gagal.', 'danger');
  }
}

// Toggle Pin
async function togglePin(noteId, currentPinnedStatus) {
  try {
    const response = await fetch(`${API_BASE}/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ isPinned: !currentPinnedStatus })
    });
    
    const result = await response.json();
    if (result.success) {
      showToast(result.note.isPinned ? 'Catatan disematkan di atas.' : 'Pin catatan dilepas.', 'success');
      fetchNotes();
    }
  } catch (error) {
    console.error('Toggle pin error:', error);
    showToast('Gagal mengubah status pin.', 'danger');
  }
}

// Delete Note
async function handleDeleteNote(noteId) {
  if (!confirm('Apakah Anda yakin ingin menghapus catatan ini selamanya?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/notes/${noteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });

    const result = await response.json();

    if (result.success) {
      showToast('Catatan telah dihapus.', 'success');
      fetchNotes();
    } else {
      showToast(result.message || 'Gagal menghapus catatan.', 'danger');
    }
  } catch (error) {
    console.error('Delete note error:', error);
    showToast('Koneksi server terputus.', 'danger');
  }
}

// ==========================================
// EDIT NOTE MODAL
// ==========================================

// Open Modal
function openEditModal(noteId) {
  const note = state.notes.find(n => n.id === noteId);
  if (!note) return;

  document.getElementById('edit-note-id').value = note.id;
  document.getElementById('edit-note-title').value = note.title;
  document.getElementById('edit-note-category').value = note.category;
  document.getElementById('edit-note-content').value = note.content;
  document.getElementById('edit-note-pinned').checked = note.isPinned;
  document.getElementById('edit-note-tags').value = note.tags.join(', ');

  // Select color in modal picker (case-insensitive check to avoid null match)
  const colorOptions = editModal.querySelectorAll('.color-option');
  let selectedRadio = null;
  
  colorOptions.forEach(opt => {
    const radioInput = opt.querySelector('input');
    const optVal = radioInput.value;
    if (note.color && optVal.toLowerCase() === note.color.toLowerCase()) {
      radioInput.checked = true;
      opt.classList.add('active');
      selectedRadio = radioInput;
    } else {
      opt.classList.remove('active');
    }
  });

  // If no match found, fallback to first option
  if (!selectedRadio && colorOptions.length > 0) {
    const firstOpt = colorOptions[0];
    const radioInput = firstOpt.querySelector('input');
    radioInput.checked = true;
    firstOpt.classList.add('active');
  }

  editModal.classList.remove('hidden');
  
  // Set focus
  document.getElementById('edit-note-title').focus();
}

// Close Modal
function closeEditModal() {
  editModal.classList.add('hidden');
  document.getElementById('edit-note-form').reset();
}

// Submit Update Note
async function handleUpdateNote(event) {
  event.preventDefault();
  
  const id = document.getElementById('edit-note-id').value;
  const title = document.getElementById('edit-note-title').value;
  const category = document.getElementById('edit-note-category').value;
  const content = document.getElementById('edit-note-content').value;
  const isPinned = document.getElementById('edit-note-pinned').checked;
  
  const colorInput = document.querySelector('input[name="edit-note-color"]:checked');
  const color = colorInput ? colorInput.value : '#8B5CF6';
  
  const tagsInput = document.getElementById('edit-note-tags').value;
  const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

  try {
    const response = await fetch(`${API_BASE}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ title, content, category, color, tags, isPinned })
    });

    const result = await response.json();

    if (result.success) {
      showToast('Perubahan berhasil disimpan!', 'success');
      closeEditModal();
      fetchNotes();
    } else {
      showToast(result.message || 'Gagal menyimpan perubahan.', 'danger');
    }
  } catch (error) {
    console.error('Update note error:', error);
    showToast('Koneksi server terganggu.', 'danger');
  }
}

// ==========================================
// RENDER & FILTER CATATAN
// ==========================================

// Set Active Category Filter Button
function setCategoryFilter(category) {
  state.currentCategoryFilter = category;
  
  // Toggle filter buttons classes
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-category') === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderNotes();
}

// Handle Search Input Change
function filterNotes() {
  state.searchQuery = document.getElementById('search-input').value.toLowerCase();
  renderNotes();
}

// Render Notes Grid based on Active state (Search & Filters)
function renderNotes() {
  // Clear previous non-loading, non-empty elements
  notesGrid.querySelectorAll('.note-card').forEach(card => card.remove());

  // Filter notes
  let filtered = state.notes;

  // Category filter
  if (state.currentCategoryFilter !== 'Semua') {
    filtered = filtered.filter(n => n.category.toLowerCase() === state.currentCategoryFilter.toLowerCase());
  }

  // Search filter
  if (state.searchQuery) {
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(state.searchQuery) || 
      n.content.toLowerCase().includes(state.searchQuery) ||
      n.tags.some(tag => tag.toLowerCase().includes(state.searchQuery))
    );
  }

  // Check Empty State
  if (filtered.length === 0) {
    notesEmpty.classList.remove('hidden');
    return;
  } else {
    notesEmpty.classList.add('hidden');
  }

  // Generate and Append Note Cards HTML
  filtered.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.style.setProperty('--note-accent', note.color);
    card.style.setProperty('--note-accent-rgb', hexToRgb(note.color));

    // Format creation Date
    const noteDate = new Date(note.updatedAt || note.createdAt);
    const dateFormatted = noteDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Generate tags HTML
    const tagsHTML = note.tags.length > 0 ? 
      `<div class="tag-list">${note.tags.map(t => `<span class="tag-badge">#${t}</span>`).join('')}</div>` 
      : '';

    card.innerHTML = `
      <div class="note-header">
        <h4>${escapeHTML(note.title)}</h4>
        <div class="note-actions">
          <button class="note-btn btn-pin ${note.isPinned ? 'pinned' : ''}" onclick="togglePin('${note.id}', ${note.isPinned})" title="${note.isPinned ? 'Lepas Pin' : 'Sematkan Catatan'}">
            <i data-lucide="pin"></i>
          </button>
          <button class="note-btn btn-edit" onclick="openEditModal('${note.id}')" title="Edit Catatan">
            <i data-lucide="edit-3"></i>
          </button>
          <button class="note-btn btn-delete" onclick="handleDeleteNote('${note.id}')" title="Hapus Catatan">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
      <div class="category-badge">${note.category}</div>
      <div class="note-content">${escapeHTML(note.content)}</div>
      ${tagsHTML}
      <div class="note-date">
        <i data-lucide="calendar" class="inline-icon"></i>
        <span>${dateFormatted}</span>
      </div>
    `;

    notesGrid.appendChild(card);
  });

  // Re-generate vector icons
  lucide.createIcons();
}

// Utility to escape HTML and prevent XSS
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Attach listeners to edit modal elements
document.addEventListener('DOMContentLoaded', () => {
  // Bind close modal if clicking outside card
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });

  // Setup color picker logic in Modal
  const editColorPicker = document.getElementById('edit-color-picker');
  editColorPicker.querySelectorAll('.color-option').forEach(option => {
    const input = option.querySelector('input');
    input.addEventListener('change', () => {
      editColorPicker.querySelectorAll('.color-option').forEach(sib => sib.classList.remove('active'));
      option.classList.add('active');
    });
  });

  // Start app
  initApp();
});
