const getUser = () => JSON.parse(sessionStorage.getItem('user'));

function showPage(pageId) {
    const user = getUser();
    if ((pageId === 'login' || pageId === 'signup') && user) {
        return showNotification('You are already logged in!');
    }
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId)?.classList.add('active');
    if (pageId === 'profile') loadUserProfile();
}

function protectedPage(pageId) {
    const user = getUser();
    if (!user) {
        showNotification('Please login first.');
        showPage('login');
        return false;
    }
    showPage(pageId);
    return true;
}

// Show notifications
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

// Load Dashboard
function loadDashboard() {
    fetch('api/get-dashboard.php')
        .then(res => res.json())
        .then(({ totalLoans, activeLoans, totalDebt, monthlyPayment, recentLoans, error }) => {
            document.getElementById('totalLoans').textContent = totalLoans;
            document.getElementById('activeLoans').textContent = activeLoans;
            document.getElementById('totalDebt').textContent = `₹${totalDebt}`;
            document.getElementById('monthlyPayment').textContent = `₹${monthlyPayment}`;
            if (!error) loadRecentLoans(recentLoans);
        });
}

// Load recent loans
function loadRecentLoans(loans = []) {
    const container = document.getElementById('recentLoans');
    container.innerHTML = loans.length
        ? loans.map(loan => {
            const status = loan.status || 'N/A';
            const statusClass = status === 'approved' ? 'approved' : status === 'pending' ? 'pending' : 'rejected';
            return `
                <div class="loan-item">
                    <h4>Type: ${loan.type.toUpperCase()} LOAN</h4>
                    <p><strong>Amount:</strong> ₹${loan.amount}</p>
                    <p><strong>EMI:</strong> ₹${loan.emi}/month</p>
                    ${status === 'approved' ? `<p><strong>Remaining:</strong> ${loan.remainingTenure} years</p>` : `<p><strong>Status:</strong> ${status}</p>`}
                    <span class="status ${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </div>`;
        }).join('')
        : '<p>No recent loans found.</p>';
}

// Load manage loans table
function loadManage() {
    const user = getUser();
    const isAdmin = user?.role === "admin";

    fetch("api/get-manage.php")
        .then(res => res.json())
        .then(loans => {
            if (loans.error) return;

            const html = loans.map(loan => `
                <tr>
                    <td>${loan.id}</td>
                    <td>${loan.type}</td>
                    <td>₹${loan.amount}</td>
                    <td>₹${loan.emi}</td>
                    <td><span class="status ${loan.status}">${loan.status}</span></td>
                    <td>${loan.nextPayment}</td>
                    <td>
                        ${isAdmin
                            ? `<button class="btn" onclick="approveLoan('${loan.id}')">Approve</button>
                               <button class="btn" onclick="rejectLoan('${loan.id}')">Reject</button>`
                            : `<button class="btn" onclick="makePayment('${loan.id}')" ${loan.status !== 'approved' ? "disabled" : ""}>
                                ${loan.status === "approved" ? "Pay Now" : "Pending"}
                            </button>`
                        }
                    </td>
                </tr>
            `).join("");

            document.getElementById("loanTable").innerHTML = html;
        });
}


// Make payment
function makePayment(loanId) {
    fetch('api/make-payment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId })
    })
    .then(res => res.json())
    .then(data => {
        showNotification(data.status === 'success'
            ? `Payment of ₹${data.amount} for ${loanId} successful!`
            : `Error: ${data.message}`);
        if (data.status === 'success') loadManage();
    });
}

// Calculator
function calculateLoan() {
    const amount = parseFloat(document.getElementById('calcAmount')?.value);
    const rate = parseFloat(document.getElementById('calcRate')?.value) / 100 / 12;
    const tenure = parseFloat(document.getElementById('calcTenure')?.value) * 12;

    if (amount && rate && tenure) {
        const emi = (amount * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
        const totalAmount = emi * tenure;
        const totalInterest = totalAmount - amount;
        document.getElementById('emi').textContent = '₹' + emi.toFixed(2);
        document.getElementById('totalInterest').textContent = '₹' + totalInterest.toFixed(2);
        document.getElementById('totalAmount').textContent = '₹' + totalAmount.toFixed(2);
    }
}

// Prefill loan form
function prefillLoanForm() {
    const user = getUser();
    if (!user) return;

    ['fullName', 'email', 'phone', 'income'].forEach(id => {
        const input = document.getElementById(id);
        const info = document.getElementById(id + 'Info');
        if (input) {
            input.value = user[id === 'fullName' ? 'name' : id] || '';
            input.readOnly = true;
        }
        if (info) info.style.display = 'block';
    });
}

// Load user profile
function loadUserProfile() {
    const user = getUser();
    if (!user) return;

    const fields = {
        profileName: 'name',
        profileEmail: 'email',
        profilePhone: 'phone',
        profileIncome: 'income',
        profileAddress: 'address',
        creditScore: 'creditScore'
    };
    for (const [id, key] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) el.value = user[key] || '';
    }
}

// Update profile
async function updateProfile() {
    const user = getUser();
    if (!user) return showNotification('User not logged in!');

    const payload = {
        email: user.email,
        name: document.getElementById('profileName').value,
        phone: document.getElementById('profilePhone').value,
        income: document.getElementById('profileIncome').value,
        address: document.getElementById('profileAddress').value,
        creditScore: document.getElementById('creditScore').value
    };

    try {
        const res = await fetch('api/update-profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.status === 'success') {
            sessionStorage.setItem('user', JSON.stringify(result.user));
            loadUserProfile();
        }
        showNotification(result.message);
    } catch (err) {
        console.error('Profile update error:', err);
        showNotification('An error occurred while updating profile.');
    }
}

// Form submissions
document.getElementById('loanForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = ['loanType', 'loanAmount', 'tenure', 'fullName', 'email', 'phone', 'income', 'purpose']
        .reduce((acc, id) => ({ ...acc, [id === 'loanAmount' ? 'amount' : id]: document.getElementById(id).value }), {});
    
    fetch('api/apply-loan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
        .then(res => res.json())
        .then(data => {
            showNotification(data.message);
            if (data.status === "success") {
                this.reset();
                document.getElementById('pageLoader').style.display = 'flex';
                setTimeout(() => window.location.reload(), 2000);
            }
        });
});

document.getElementById('signupForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const payload = ['signupName', 'signupEmail', 'signupPhone', 'signupPassword', 'signupIncome', 'signupAddress', 'signupCreditScore']
        .reduce((acc, id) => {
            const key = id.replace(/^signup/, '').replace(/^./, c => c.toLowerCase());
            acc[key] = document.getElementById(id).value;
            return acc;
        }, {});

    const response = await fetch('/api/signup.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json();
    showNotification(result.message);
    if (result.status === "success") {
        document.getElementById('pageLoader').style.display = 'flex';
        setTimeout(() => window.location.reload(), 1000);
    }
});

document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };
    fetch('api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    }).then(res => res.json()).then(data => {
        showNotification(data.message);
        if (data.status === "success") {
            const user = data.user;
            if (user.email === "admin@loancart.com") {
                user.role = "admin";
            } else {
                user.role = "user";
            }
            sessionStorage.setItem("user", JSON.stringify(user));
            showPage("manage");
            document.getElementById('pageLoader').style.display = 'flex';
            setTimeout(() => window.location.reload(), 1000);
        }
    });
});

function logoutUser() {
    sessionStorage.removeItem('user');
    fetch('api/logout.php').then(() => {
        showNotification('Logged out successfully');
        document.getElementById('pageLoader').style.display = 'flex';
        setTimeout(() => window.location.reload(), 1000);
    });
}

function updateNavForAuth() {
    const user = getUser();

    const isAdmin = user?.role === "admin";

    // Toggle nav items
    document.getElementById("navLogin").style.display = user ? "none" : "inline";
    document.getElementById("navSignup").style.display = user ? "none" : "inline";
    document.getElementById("navLogout").style.display = user ? "inline" : "none";

    // Hide or show non-admin nav links
    document.querySelectorAll(".nav-links li").forEach(li => {
        const linkText = li.textContent.trim();
        if (user) {
            if (isAdmin && !["Manage", "Logout"].includes(linkText)) {
                li.style.display = "none";
            } else if (!isAdmin && ["Dashboard", "Apply", "Calculator", "Manage", "Profile", "Logout","home"].includes(linkText)) {
                li.style.display = "inline";
            }
        } else {
            li.style.display = "inline";
            document.getElementById("navLogout").style.display = user ? "inline" : "none";
        }
    });

    // Update logo with user name
    document.querySelector(".logo").innerHTML = user ? `💰 LoanCart - Hi, ${user.name || 'Admin'}` : "💰 LoanCart";
}

// Mobile menu toggle
document.querySelector('.mobile-menu')?.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Page init
document.addEventListener('DOMContentLoaded', () => {
    updateNavForAuth();
    calculateLoan();
    loadDashboard();
    loadManage();
    prefillLoanForm();
    if(getUser() && getUser().role === "admin" ) {
        showPage('manage');
    }
});
window.addEventListener('load', calculateLoan);

// Placeholder
function saveSettings() {
    showNotification('Settings saved successfully!');
}
function approveLoan(loanId) {
    fetch("api/admin-approve-loan.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId })
    })
    .then(res => res.json())
    .then(res => {
        showNotification(res.message);
        if (res.status === "success") loadManage();
    });
}

function rejectLoan(loanId) {
    fetch("api/admin-reject-loan.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId })
    })
    .then(res => res.json())
    .then(res => {
        showNotification(res.message);
        if (res.status === "success") loadManage();
    });
}