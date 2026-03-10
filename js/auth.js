async function signInWithGoogle(promoCodeUsed = null) {
    try {
        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/dashboard.html',
                data: {
                    promo_code_used: promoCodeUsed
                }
            }
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error signing in with Google:', error.message);
        alert('Error: ' + error.message);
    }
}

async function signOut() {
    const { error } = await window.supabaseClient.auth.signOut();
    if (!error) {
        window.location.href = 'index.html';
    } else {
        console.error('Logout error:', error.message);
    }
}

async function checkSession() {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    return session;
}

// Export functions to global window for accessibility
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;
window.checkSession = checkSession;

