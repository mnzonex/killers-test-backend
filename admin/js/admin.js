let allUsers = [];
let allPromoCodes = [];
let selectedUser = null;

async function initAdmin() {
  const session = await window.checkSession();
  if (!session) {
    window.location.href = '../login.html';
    return;
  }

  // Admin Access Check
  if (session.user.email !== 'admin@killersvip.com') {
    alert('Access Denied. Internal Admin Only.');
    window.location.href = '../dashboard.html';
    return;
  }

  // Check if Master Key is already verified in this session
  if (sessionStorage.getItem('admin_master_key_verified') === 'true') {
    hideLock();
    await refreshData();
  } else {
    showLock();
  }
}

function showLock() {
  document.getElementById('adminLockScreen').classList.add('active');
  document.getElementById('unlockBtn').onclick = verifyMasterKey;
}

function hideLock() {
  document.getElementById('adminLockScreen').classList.remove('active');
  document.querySelector('.admin-wrapper').style.filter = 'none';
  document.querySelector('.admin-wrapper').style.pointerEvents = 'auto';
}

async function verifyMasterKey() {
  const inputCode = document.getElementById('masterKeyInput').value;
  const msg = document.getElementById('lockMsg');

  // Fetch real Master Key from Supabase
  const { data, error } = await window.supabaseClient
    .from('admin_config')
    .select('key_value')
    .eq('key_name', 'master_key')
    .single();

  if (data && inputCode === data.key_value) {
    sessionStorage.setItem('admin_master_key_verified', 'true');
    hideLock();
    await refreshData();
  } else {
    msg.textContent = 'Invalid Master Key. Access Denied.';
    msg.style.color = '#ef4444';
    setTimeout(() => { signOut(); }, 2000);
  }
}

async function refreshData() {
  // 1. Fetch Stats
  const { data: users, error: userError } = await window.supabaseClient.from('users').select('*');
  if (userError) return console.error(userError);
  allUsers = users;

  const total = users.length;
  const pending = users.filter(u => u.status === 'Pending').length;
  const active = users.filter(u => u.status === 'Active').length;

  document.getElementById('stat-total-users').textContent = total;
  document.getElementById('stat-pending-users').textContent = pending;
  document.getElementById('stat-active-users').textContent = active;

  // 2. Fetch Promo Codes
  const { data: promoCodes, error: promoError } = await window.supabaseClient.from('promo_codes').select('*');
  if (promoError) return console.error(promoError);
  allPromoCodes = promoCodes;

  updateDashboard();
  updateUserTable();
  updatePromoTable();
}

function updateDashboard() {
  // Calculate Leaderboard
  const leaderboard = allPromoCodes.map(promo => {
    const signups = allUsers.filter(u => u.promo_code_used === promo.code).length;
    const activeUsers = allUsers.filter(u => u.promo_code_used === promo.code && (u.status === 'Active' || u.status === 'Pending')).length;
    const convRate = signups > 0 ? (activeUsers / signups * 100).toFixed(1) : 0;
    return { ...promo, signups, activeUsers, convRate };
  }).sort((a, b) => b.signups - a.signups);

  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = leaderboard.map(p => `
    <tr>
      <td>${p.code}</td>
      <td>${p.owner_name}</td>
      <td>${p.signups}</td>
      <td>${p.activeUsers}</td>
      <td>${p.convRate}%</td>
    </tr>
  `).join('');
}

function updateUserTable() {
  const filterStatus = document.getElementById('status-filter').value;
  const query = document.getElementById('user-search').value.toLowerCase();

  const filtered = allUsers.filter(u => {
    const statusMatch = filterStatus === 'all' || u.status === filterStatus;
    const queryMatch = !query || u.email.toLowerCase().includes(query) || (u.name && u.name.toLowerCase().includes(query));
    return statusMatch && queryMatch;
  });

  const tbody = document.getElementById('user-table-body');
  tbody.innerHTML = filtered.map(u => `
    <tr>
      <td>
        <div class="user-row">
          <img src="${u.avatar_url || '../assets/logo.jpg'}" class="table-avatar">
          <div>
            <strong>${u.name || 'User'}</strong><br>
            <small>${u.email}</small>
          </div>
        </div>
      </td>
      <td><span class="badge ${u.status.toLowerCase()}">${u.status}</span></td>
      <td>${u.active_package || 'None'}</td>
      <td>${u.promo_code_used || '-'}</td>
      <td>
        <button class="btn-manage" onclick="openUserModal('${u.id}')">Manage</button>
      </td>
    </tr>
  `).join('');
}

function openUserModal(id) {
  selectedUser = allUsers.find(u => u.id === id);
  const details = document.getElementById('modal-user-details');
  details.innerHTML = `
    <p><strong>Name:</strong> ${selectedUser.name || 'N/A'}</p>
    <p><strong>Email:</strong> ${selectedUser.email}</p>
    <p><strong>Package:</strong> ${selectedUser.active_package || 'None'}</p>
    <p><strong>Status:</strong> ${selectedUser.status}</p>
  `;
  document.getElementById('expiry-date').value = selectedUser.expiry_date ? selectedUser.expiry_date.split('T')[0] : '';
  document.getElementById('admin-notes').value = selectedUser.admin_notes || '';

  const activateBtn = document.getElementById('activate-confirm-btn');
  activateBtn.onclick = async () => {
    const expiry = document.getElementById('expiry-date').value;
    const notes = document.getElementById('admin-notes').value;

    const { error } = await window.supabaseClient
      .from('users')
      .update({
        status: 'Active',
        expiry_date: expiry || null,
        admin_notes: notes
      })
      .eq('id', selectedUser.id);

    if (error) alert(error.message);
    else {
      await window.supabaseClient.from('activity_logs').insert({
        user_id: selectedUser.id,
        action: 'Activated by Admin'
      });
      closeModal();
      refreshData();
    }
  };

  document.getElementById('userModal').classList.add('active');
}

function closeModal() {
  document.getElementById('userModal').classList.remove('active');
}

function updatePromoTable() {
  const tbody = document.getElementById('promo-table-body');
  tbody.innerHTML = allPromoCodes.map(p => `
    <tr>
      <td>${p.code}</td>
      <td>${p.owner_name}</td>
      <td>${p.whatsapp_number}</td>
      <td>
        <small>C: $${p.crypto_price} | F: $${p.forex_price} | A: $${p.all_price}</small>
      </td>
      <td>
        <button class="btn-edit-promo" onclick="editPromo('${p.code}')"><i class="fas fa-edit"></i></button>
      </td>
    </tr>
  `).join('');
}

function openPromoModal(code = null) {
  const modal = document.getElementById('promoModal');
  const title = document.getElementById('promo-modal-title');
  const codeInp = document.getElementById('promo-code-input');

  if (code) {
    const p = allPromoCodes.find(x => x.code === code);
    title.textContent = 'Edit Promo Code';
    codeInp.value = p.code;
    codeInp.disabled = true;
    document.getElementById('promo-owner-input').value = p.owner_name;
    document.getElementById('promo-whatsapp-input').value = p.whatsapp_number;
    document.getElementById('promo-bank-input').value = p.bank_details;
    document.getElementById('promo-crypto-price').value = p.crypto_price;
    document.getElementById('promo-forex-price').value = p.forex_price;
    document.getElementById('promo-all-price').value = p.all_price;
  } else {
    title.textContent = 'Add New Promo Code';
    codeInp.value = '';
    codeInp.disabled = false;
    document.getElementById('promo-owner-input').value = '';
    document.getElementById('promo-whatsapp-input').value = '';
    document.getElementById('promo-bank-input').value = '';
    document.getElementById('promo-crypto-price').value = 30;
    document.getElementById('promo-forex-price').value = 40;
    document.getElementById('promo-all-price').value = 60;
  }

  modal.classList.add('active');
  document.getElementById('save-promo-btn').onclick = () => savePromo(code);
}

async function savePromo(isEdit = null) {
  const code = document.getElementById('promo-code-input').value.toUpperCase();
  const payload = {
    code: code,
    owner_name: document.getElementById('promo-owner-input').value,
    whatsapp_number: document.getElementById('promo-whatsapp-input').value,
    bank_details: document.getElementById('promo-bank-input').value,
    crypto_price: document.getElementById('promo-crypto-price').value,
    forex_price: document.getElementById('promo-forex-price').value,
    all_price: document.getElementById('promo-all-price').value
  };

  const { error } = await window.supabaseClient.from('promo_codes').upsert(payload);

  if (error) alert(error.message);
  else {
    closePromoModal();
    refreshData();
  }
}

function closePromoModal() {
  document.getElementById('promoModal').classList.remove('active');
}

function editPromo(code) {
  openPromoModal(code);
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.getElementById(`${tabId}-tab`).classList.remove('hidden');

  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  document.querySelector(`.sidebar-nav a[href="#${tabId}"]`).classList.add('active');

  const titleMap = { analytics: 'Analytics Overview', users: 'User Management', promo: 'Promo Codes', settings: 'Settings' };
  document.getElementById('tab-title').textContent = titleMap[tabId];
}

window.onload = initAdmin;
document.getElementById('user-search').addEventListener('input', updateUserTable);
document.getElementById('status-filter').addEventListener('change', updateUserTable);
