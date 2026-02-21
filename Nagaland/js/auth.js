/* ============================================
   NAGALAND STONE CRUSHER — AUTH SYSTEM
   ============================================
   Handles login, signup, session, order history.
   Uses localStorage for a static site.
   ============================================ */

const AUTH = {
    USERS_KEY: 'nsc_users',
    SESSION_KEY: 'nsc_session',
    ORDERS_KEY: 'nsc_orders',

    // --- Helpers ---
    _getUsers() {
        try { return JSON.parse(localStorage.getItem(this.USERS_KEY)) || []; }
        catch { return []; }
    },
    _saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    },
    _getOrders() {
        try { return JSON.parse(localStorage.getItem(this.ORDERS_KEY)) || []; }
        catch { return []; }
    },
    _saveOrders(orders) {
        localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    },

    // --- Signup ---
    signup({ name, phone, email, password }) {
        const users = this._getUsers();
        // Check duplicate phone
        if (users.find(u => u.phone === phone)) {
            return { ok: false, msg: 'This phone number is already registered. Please login.' };
        }
        // Check duplicate email
        if (email && users.find(u => u.email === email)) {
            return { ok: false, msg: 'This email is already registered. Please login.' };
        }
        const user = {
            id: 'USR_' + Date.now(),
            name,
            phone,
            email: email || '',
            password: btoa(password), // base64 encode (not real encryption, but obscures)
            createdAt: new Date().toISOString(),
            provider: 'email'
        };
        users.push(user);
        this._saveUsers(users);
        this._setSession(user);
        return { ok: true, user };
    },

    // --- Login ---
    login({ identifier, password }) {
        const users = this._getUsers();
        const user = users.find(u =>
            (u.phone === identifier || u.email === identifier) &&
            u.password === btoa(password)
        );
        if (!user) {
            return { ok: false, msg: 'Invalid phone/email or password. Please try again.' };
        }
        this._setSession(user);
        return { ok: true, user };
    },

    // --- Google Auth (simulated) ---
    googleAuth() {
        // In a real app, this would use Firebase/Google OAuth
        // For now, we show a prompt
        const email = prompt('Enter your Google email address:');
        if (!email || !email.includes('@')) {
            return { ok: false, msg: 'Invalid email address.' };
        }
        const users = this._getUsers();
        let user = users.find(u => u.email === email);
        if (user) {
            this._setSession(user);
            return { ok: true, user, isNew: false };
        }
        // Create new account with Google
        const name = prompt('First time? Enter your name:') || 'Customer';
        const phone = prompt('Enter your phone number (10 digits):') || '';
        user = {
            id: 'USR_' + Date.now(),
            name,
            phone,
            email,
            password: btoa(email + '_google'),
            createdAt: new Date().toISOString(),
            provider: 'google'
        };
        users.push(user);
        this._saveUsers(users);
        this._setSession(user);
        return { ok: true, user, isNew: true };
    },

    // --- Phone OTP Auth (simulated) ---
    phoneAuth(phone) {
        const users = this._getUsers();
        let user = users.find(u => u.phone === phone);
        if (user) {
            this._setSession(user);
            return { ok: true, user, isNew: false };
        }
        // Create new account with phone
        const name = prompt('First time? Enter your name:') || 'Customer';
        user = {
            id: 'USR_' + Date.now(),
            name,
            phone,
            email: '',
            password: btoa(phone + '_phone'),
            createdAt: new Date().toISOString(),
            provider: 'phone'
        };
        users.push(user);
        this._saveUsers(users);
        this._setSession(user);
        return { ok: true, user, isNew: true };
    },

    // --- Forgot Password ---
    resetPassword(identifier, newPassword) {
        const users = this._getUsers();
        const idx = users.findIndex(u => u.phone === identifier || u.email === identifier);
        if (idx === -1) {
            return { ok: false, msg: 'No account found with this phone/email.' };
        }
        users[idx].password = btoa(newPassword);
        this._saveUsers(users);
        return { ok: true, msg: 'Password reset successful! You can now login.' };
    },

    // --- Session ---
    _setSession(user) {
        const session = {
            userId: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            provider: user.provider,
            loggedInAt: new Date().toISOString()
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    },

    getSession() {
        try { return JSON.parse(localStorage.getItem(this.SESSION_KEY)); }
        catch { return null; }
    },

    isLoggedIn() {
        return this.getSession() !== null;
    },

    logout() {
        localStorage.removeItem(this.SESSION_KEY);
    },

    // --- Order History ---
    addOrder(order) {
        const session = this.getSession();
        if (!session) return;
        const orders = this._getOrders();
        orders.push({
            ...order,
            userId: session.userId,
            orderId: 'ORD_' + Date.now(),
            date: new Date().toISOString(),
            status: 'Sent via WhatsApp'
        });
        this._saveOrders(orders);
    },

    getMyOrders() {
        const session = this.getSession();
        if (!session) return [];
        return this._getOrders()
            .filter(o => o.userId === session.userId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    // --- Get all orders (admin) ---
    getAllOrders() {
        return this._getOrders().sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    getAllUsers() {
        return this._getUsers().map(u => ({
            id: u.id,
            name: u.name,
            phone: u.phone,
            email: u.email,
            provider: u.provider,
            createdAt: u.createdAt
        }));
    },

    // --- Update Profile ---
    updateProfile({ name, phone, email }) {
        const session = this.getSession();
        if (!session) return { ok: false };
        const users = this._getUsers();
        const idx = users.findIndex(u => u.id === session.userId);
        if (idx === -1) return { ok: false };
        if (name) users[idx].name = name;
        if (phone) users[idx].phone = phone;
        if (email) users[idx].email = email;
        this._saveUsers(users);
        this._setSession(users[idx]);
        return { ok: true };
    }
};

// --- Update Navbar based on auth state ---
function updateNavAuth() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Remove existing auth link
    const existing = navLinks.querySelector('.auth-nav-item');
    if (existing) existing.remove();

    const li = document.createElement('li');
    li.className = 'auth-nav-item';

    if (AUTH.isLoggedIn()) {
        const session = AUTH.getSession();
        const firstName = session.name.split(' ')[0];
        li.innerHTML = `<a href="account.html" class="nav-auth-btn" title="${session.name}">👤 ${firstName}</a>`;
    } else {
        li.innerHTML = `<a href="login.html" class="nav-auth-btn">Login</a>`;
    }
    navLinks.appendChild(li);
}

// Run on every page
document.addEventListener('DOMContentLoaded', updateNavAuth);
