let currentUser = null;
let currentPromo = null;
let selectedPkgName = null;
let selectedPkgPrice = null;

async function initDashboard() {
    const session = await window.checkSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const user = session.user;
    document.getElementById('user-name').textContent = user.user_metadata.full_name || user.email;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-avatar').src = user.user_metadata.avatar_url || 'assets/logo.jpg';

    // 1. Fetch user data from DB
    const { data: dbUser, error: userError } = await window.supabaseClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    if (userError) {
        console.error('Error fetching user:', userError);
        // Silent fail or show warning
    } else {
        currentUser = dbUser;
    }

    // 2. Promo Code Initial Handling if not in DB
    if (currentUser && !currentUser.promo_code_used) {
        const backupPromo = localStorage.getItem('referral_promo') || 'KILLERS10';
        await window.supabaseClient
            .from('users')
            .update({ promo_code_used: backupPromo })
            .eq('id', user.id);
        currentUser.promo_code_used = backupPromo;
    }

    // 3. Fetch promo details for payment routing
    if (currentUser && currentUser.promo_code_used) {
        const { data: promoData } = await window.supabaseClient
            .from('promo_codes')
            .select('*')
            .eq('code', currentUser.promo_code_used)
            .single();
        currentPromo = promoData;
    }

    updateUI();
}

function updateUI() {
    const status = currentUser?.status || 'Registered';
    const badge = document.getElementById('status-badge');
    badge.textContent = status;
    badge.className = 'badge ' + status.toLowerCase();

    // Reset progress steps
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active', 'completed'));

    if (status === 'Registered') {
        document.getElementById('step-registered').classList.add('active');
        document.getElementById('package-section').classList.remove('hidden');
        document.getElementById('step-registered').classList.add('completed');
    } else if (status === 'Pending') {
        document.getElementById('step-registered').classList.add('completed');
        document.getElementById('step-pending').classList.add('active');
        document.getElementById('package-section').classList.add('hidden');
        document.getElementById('payment-section').classList.add('hidden');
        // Show a "Wait for activation" message
        document.querySelector('.status-section').innerHTML += `<p class="waiting-msg"><i class="fas fa-clock"></i> We are verifying your payment. Your signals will be active soon!</p>`;
    } else if (status === 'Active') {
        document.getElementById('step-registered').classList.add('completed');
        document.getElementById('step-pending').classList.add('completed');
        document.getElementById('step-active').classList.add('completed');
        document.getElementById('active-section').classList.remove('hidden');
        document.getElementById('package-section').classList.add('hidden');
        document.getElementById('payment-section').classList.add('hidden');

        if (currentUser.expiry_date) {
            document.getElementById('expiry-txt').textContent = new Date(currentUser.expiry_date).toLocaleDateString();
        }
    }
}

function selectPkg(name, price) {
    selectedPkgName = name;

    // Use price from currentPromo if available, else use default hardcoded
    if (currentPromo) {
        if (name === 'Crypto VIP') price = currentPromo.crypto_price;
        if (name === 'Forex VIP') price = currentPromo.forex_price;
        if (name === 'All-in-One VIP') price = currentPromo.all_price;
    }

    selectedPkgPrice = price;

    if (!currentPromo) {
        alert('Promo code not found. Using default routing.');
    }

    document.getElementById('package-section').classList.add('hidden');
    document.getElementById('payment-section').classList.remove('hidden');

    document.getElementById('manager-name').textContent = currentPromo ? currentPromo.owner_name : 'Support';
    const bankBox = document.getElementById('bank-details-box');
    bankBox.innerHTML = `<pre>${currentPromo ? currentPromo.bank_details : 'Please contact support for payment details.'}</pre>`;

    const paidBtn = document.getElementById('paid-btn');
    paidBtn.onclick = handlePaidClick;
}

function hidePayment() {
    document.getElementById('payment-section').classList.add('hidden');
    document.getElementById('package-section').classList.remove('hidden');
}

async function handlePaidClick() {
    if (!currentUser || !selectedPkgName) return;

    // 1. Update status to Pending in DB
    const { error } = await window.supabaseClient
        .from('users')
        .update({
            status: 'Pending',
            active_package: selectedPkgName
        })
        .eq('id', currentUser.id);

    if (error) {
        alert('Error updating status: ' + error.message);
        return;
    }

    // 2. Log activity
    await window.supabaseClient.from('activity_logs').insert({
        user_id: currentUser.id,
        action: `Clicked Paid for ${selectedPkgName}`
    });

    // 3. Prepare WhatsApp Message
    const waNum = currentPromo?.whatsapp_number || '+94700000000'; // Fallback
    const msg = `Hi Admin, I'm ${currentUser.name || 'User'}, Email: ${currentUser.email}. I used code: ${currentUser.promo_code_used}. Here is my receipt for ${selectedPkgName} (${selectedPkgPrice} USDT).`;
    const encodedMsg = encodeURIComponent(msg);

    window.open(`https://wa.me/${waNum.replace(/\D/g, '')}?text=${encodedMsg}`, '_blank');

    // Refresh UI
    currentUser.status = 'Pending';
    updateUI();
}

window.initDashboard = initDashboard;
document.addEventListener('DOMContentLoaded', initDashboard);
