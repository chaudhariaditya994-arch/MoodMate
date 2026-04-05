const AUTH_USERS_KEY = 'moodmate_users';
const AUTH_CURRENT_KEY = 'moodmate_currentUser';

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`).join(''));
    return JSON.parse(jsonPayload);
}

function getUsers() {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(AUTH_CURRENT_KEY));
}

function setCurrentUser(user) {
    localStorage.setItem(AUTH_CURRENT_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem(AUTH_CURRENT_KEY);
}

function getUserScopedKey(key) {
    const user = getCurrentUser();
    return user ? `${key}_${user.email}` : key;
}

function findUserByEmail(email) {
    const users = getUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

function signUpLocal(name, email, password) {
    const existing = findUserByEmail(email);
    if (existing) {
        return { success: false, message: 'Account already exists with that email.' };
    }

    const user = { name, email, password, google: false };
    const users = getUsers();
    users.push(user);
    saveUsers(users);
    setCurrentUser({ name, email, google: false });
    return { success: true };
}

function signInLocal(email, password) {
    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
        return { success: false, message: 'Email or password is incorrect.' };
    }

    setCurrentUser({ name: user.name, email: user.email, google: user.google });
    return { success: true };
}

function signInWithGooglePayload(payload) {
    if (!payload.email) {
        return { success: false, message: 'Google account did not return an email.' };
    }

    let user = findUserByEmail(payload.email);
    if (!user) {
        user = { name: payload.name || payload.email, email: payload.email, google: true };
        const users = getUsers();
        users.push(user);
        saveUsers(users);
    }

    setCurrentUser({ name: payload.name || payload.email, email: payload.email, google: true });
    return { success: true };
}

function handleCredentialResponse(response) {
    const payload = parseJwt(response.credential);
    const result = signInWithGooglePayload(payload);
    if (result.success) {
        window.location.href = 'index.html';
    } else {
        if (typeof showMessage === 'function') {
            showMessage(result.message);
        } else {
            alert(result.message);
        }
    }
}

function initializeGoogleSignIn() {
    if (!window.google || !google.accounts || !google.accounts.id) return;

    google.accounts.id.initialize({
        // Replace with your Google OAuth client ID for sign-in to work.
        client_id: 'YOUR_GOOGLE_CLIENT_ID',
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
    });

    const googleLogin = document.getElementById('googleSignInBtn');
    if (googleLogin) {
        google.accounts.id.renderButton(googleLogin, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: '100%'
        });
    }

    const googleSignup = document.getElementById('googleSignUpBtn');
    if (googleSignup) {
        google.accounts.id.renderButton(googleSignup, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: '100%'
        });
    }
}

function signOut() {
    clearCurrentUser();
    window.location.href = 'login.html';
}

function protectPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    if (['login.html', 'signup.html'].includes(path)) {
        return;
    }

    if (!getCurrentUser()) {
        window.location.href = 'login.html';
    }
}

function redirectIfSignedIn() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    if (['login.html', 'signup.html'].includes(path) && getCurrentUser()) {
        window.location.href = 'index.html';
    }
}

function attachAuthHandlers() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const result = signInLocal(email, password);
            if (!result.success) {
                if (typeof showMessage === 'function') {
                    showMessage(result.message);
                } else {
                    alert(result.message);
                }
                return;
            }
            window.location.href = 'index.html';
        });
    }

    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const result = signUpLocal(name, email, password);
            if (!result.success) {
                if (typeof showMessage === 'function') {
                    showMessage(result.message);
                } else {
                    alert(result.message);
                }
                return;
            }
            window.location.href = 'index.html';
        });
    }

    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', signOut);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    redirectIfSignedIn();
    protectPage();
    attachAuthHandlers();
    initializeGoogleSignIn();
});
