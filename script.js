/* ===================================
   VOTING SYSTEM - MAIN JAVASCRIPT
   Educational/Demo Purpose Only
   =================================== */

// ===================================
// DATA - Political Parties
// ===================================

const politicalParties = [
    {
        id: 'party1',
        name: 'Progressive Unity Party',
        leader: 'Dr. Ramesh Sharma',
        logo: '🏛️',
        slogan: 'Building tomorrow, together',
        color: '#2563eb'
    },
    {
        id: 'party2',
        name: 'National Development Alliance',
        leader: 'Sita Thapa',
        logo: '🌟',
        slogan: 'Growth for all, prosperity for everyone',
        color: '#10b981'
    },
    {
        id: 'party3',
        name: 'Democratic Reform Coalition',
        leader: 'Krishna Gurung',
        logo: '🏔️',
        slogan: 'Justice, equality, progress',
        color: '#f59e0b'
    },
    {
        id: 'party4',
        name: 'People\'s Welfare Movement',
        leader: 'Maya Rai',
        logo: '🕊️',
        slogan: 'Your voice, our strength',
        color: '#ef4444'
    }
];

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Initialize localStorage data structure
function initializeData() {
    if (!localStorage.getItem('votingData')) {
        const initialData = {
            votes: {},
            hasVoted: false,
            votedParty: null,
            timestamp: null
        };
        
        // Initialize vote counts for all parties
        politicalParties.forEach(party => {
            initialData.votes[party.id] = 0;
        });
        
        localStorage.setItem('votingData', JSON.stringify(initialData));
    }
}

// Get voting data from localStorage
function getVotingData() {
    return JSON.parse(localStorage.getItem('votingData'));
}

// Update voting data in localStorage
function updateVotingData(data) {
    localStorage.setItem('votingData', JSON.stringify(data));
}

// Get total votes
function getTotalVotes() {
    const data = getVotingData();
    return Object.values(data.votes).reduce((sum, count) => sum + count, 0);
}

// Get sorted parties by votes
function getSortedParties() {
    const data = getVotingData();
    return politicalParties
        .map(party => ({
            ...party,
            votes: data.votes[party.id] || 0
        }))
        .sort((a, b) => b.votes - a.votes);
}

// ===================================
// VOTING PAGE FUNCTIONS
// ===================================

// Render party cards
function renderPartyCards() {
    const grid = document.getElementById('partiesGrid');
    if (!grid) return;
    
    const data = getVotingData();
    const hasVoted = data.hasVoted;
    
    grid.innerHTML = '';
    
    politicalParties.forEach((party, index) => {
        const card = document.createElement('div');
        card.className = 'party-card';
        if (hasVoted) card.classList.add('voted');
        
        card.innerHTML = `
            <div class="party-header">
                <div class="party-logo" style="background: ${party.color}20; color: ${party.color}">
                    ${party.logo}
                </div>
                <div class="party-info">
                    <h3 class="party-name">${party.name}</h3>
                    <p class="party-leader">
                        <span class="leader-photo">${party.leader.charAt(0)}</span>
                        ${party.leader}
                    </p>
                </div>
            </div>
            <p class="party-slogan">${party.slogan}</p>
            <div class="party-actions">
                ${hasVoted ? 
                    (data.votedParty === party.id ? 
                        '<button class="btn btn-success" disabled>✓ Your Vote</button>' :
                        '<button class="btn btn-secondary" disabled>Vote</button>'
                    ) :
                    `<button class="btn btn-primary" onclick="showConfirmModal('${party.id}')">Vote for ${party.name.split(' ')[0]}</button>`
                }
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    // Update voting status
    updateVotingStatus();
}

// Update voting status message
function updateVotingStatus() {
    const statusDiv = document.getElementById('votingStatus');
    if (!statusDiv) return;
    
    const data = getVotingData();
    
    if (data.hasVoted) {
        const votedParty = politicalParties.find(p => p.id === data.votedParty);
        statusDiv.innerHTML = `✓ You have already voted for ${votedParty ? votedParty.name : 'a party'}`;
        statusDiv.style.background = 'var(--color-success-light)';
        statusDiv.style.color = 'var(--color-success)';
    } else {
        statusDiv.innerHTML = '● Voting is open - Choose your party';
        statusDiv.style.background = 'var(--color-primary-light)';
        statusDiv.style.color = 'var(--color-primary)';
    }
}

// Show confirmation modal
let selectedPartyId = null;

function showConfirmModal(partyId) {
    selectedPartyId = partyId;
    const party = politicalParties.find(p => p.id === partyId);
    
    const modal = document.getElementById('confirmModal');
    const logo = document.getElementById('confirmLogo');
    const name = document.getElementById('confirmPartyName');
    const leader = document.getElementById('confirmLeader');
    
    logo.innerHTML = `<div class="party-logo" style="background: ${party.color}20; color: ${party.color}">${party.logo}</div>`;
    name.textContent = party.name;
    leader.textContent = `Leader: ${party.leader}`;
    
    modal.classList.add('active');
}

// Close confirmation modal
function closeModal() {
    selectedPartyId = null;
    document.getElementById('confirmModal').classList.remove('active');
}

// Confirm and submit vote
function confirmVote() {
    if (!selectedPartyId) return;
    
    const data = getVotingData();
    
    // Record the vote
    data.votes[selectedPartyId] = (data.votes[selectedPartyId] || 0) + 1;
    data.hasVoted = true;
    data.votedParty = selectedPartyId;
    data.timestamp = new Date().toISOString();
    
    updateVotingData(data);
    
    // Close confirm modal
    closeModal();
    
    // Show success modal
    showSuccessModal();
    
    // Re-render cards
    renderPartyCards();
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('active');
}

// Close success modal and redirect to results
function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
    window.location.href = 'results.html';
}

// ===================================
// RESULTS PAGE FUNCTIONS
// ===================================

// Animate counter
function animateCounter(element, target, duration = 1000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = Math.round(target);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(start);
        }
    }, 16);
}

// Initialize results page
function initResults() {
    const totalVotes = getTotalVotes();
    const sortedParties = getSortedParties();
    const leadingParty = sortedParties[0];
    
    // Update stats
    const totalVotesEl = document.getElementById('totalVotes');
    if (totalVotesEl) {
        animateCounter(totalVotesEl, totalVotes);
    }
    
    const leadingPartyEl = document.getElementById('leadingParty');
    if (leadingPartyEl) {
        leadingPartyEl.textContent = leadingParty ? leadingParty.name : 'No votes yet';
    }
    
    const participationEl = document.getElementById('participation');
    if (participationEl) {
        // Assuming max 1000 potential voters for demo
        const percentage = ((totalVotes / 1000) * 100).toFixed(1);
        participationEl.textContent = `${percentage}%`;
    }
    
    // Render rankings
    renderRankings();
    
    // Render chart
    renderChart();
}

// Render rankings grid
function renderRankings() {
    const grid = document.getElementById('rankingsGrid');
    if (!grid) return;
    
    const sortedParties = getSortedParties();
    const totalVotes = getTotalVotes();
    
    grid.innerHTML = '';
    
    sortedParties.forEach((party, index) => {
        const percentage = totalVotes > 0 ? ((party.votes / totalVotes) * 100).toFixed(1) : 0;
        const rank = index + 1;
        
        const card = document.createElement('div');
        card.className = `ranking-card ${rank === 1 ? 'first' : ''}`;
        
        card.innerHTML = `
            <div class="rank-badge">${rank === 1 ? '👑' : rank}</div>
            <div class="ranking-info">
                <h3 class="ranking-party">${party.name}</h3>
                <p class="ranking-leader">${party.leader}</p>
            </div>
            <div class="ranking-stats">
                <div class="ranking-votes">${party.votes}</div>
                <div class="ranking-percentage">${percentage}%</div>
            </div>
        `;
        
        grid.appendChild(card);
        
        // Animate card entrance
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateX(0)';
            }, 50);
        }, index * 100);
    });
}

// Render chart using Chart.js
function renderChart() {
    const canvas = document.getElementById('votesChart');
    if (!canvas) return;
    
    const sortedParties = getSortedParties();
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.votesChart) {
        window.votesChart.destroy();
    }
    
    window.votesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedParties.map(p => p.name),
            datasets: [{
                label: 'Votes',
                data: sortedParties.map(p => p.votes),
                backgroundColor: sortedParties.map(p => p.color + '40'),
                borderColor: sortedParties.map(p => p.color),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    borderRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            const total = getTotalVotes();
                            const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                            return `Votes: ${context.raw} (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    });
}

// ===================================
// ADMIN LOGIN FUNCTIONS
// ===================================

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMessage');
    
    // Demo credentials
    if (username === 'singhthakuriswapneel@gmail.com' && password === 'test123') {
        localStorage.setItem('adminLoggedIn', 'true');
        window.location.href = 'admin.html';
    } else {
        errorMsg.textContent = 'Invalid username or password';
        errorMsg.classList.add('show');
        
        // Shake animation
        const form = document.getElementById('loginForm');
        form.style.animation = 'shake 0.5s';
        setTimeout(() => {
            form.style.animation = '';
        }, 500);
    }
}

// Add shake animation to CSS dynamically
if (!document.querySelector('style[data-shake]')) {
    const style = document.createElement('style');
    style.setAttribute('data-shake', 'true');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);
}

// ===================================
// ADMIN DASHBOARD FUNCTIONS
// ===================================

function initAdminDashboard() {
    const totalVotes = getTotalVotes();
    const sortedParties = getSortedParties();
    const leadingParty = sortedParties[0];
    const data = getVotingData();
    
    // Update stats
    const totalVotesEl = document.getElementById('adminTotalVotes');
    if (totalVotesEl) {
        animateCounter(totalVotesEl, totalVotes);
    }
    
    const leadingPartyEl = document.getElementById('adminLeadingParty');
    if (leadingPartyEl) {
        leadingPartyEl.textContent = leadingParty ? leadingParty.name : 'No votes yet';
    }
    
    const statusEl = document.getElementById('votingStatusText');
    if (statusEl) {
        statusEl.textContent = data.hasVoted ? 'Locked' : 'Active';
        statusEl.style.color = data.hasVoted ? 'var(--color-warning)' : 'var(--color-success)';
    }
    
    // Render results table
    renderAdminResultsTable();
}

function renderAdminResultsTable() {
    const tableBody = document.getElementById('adminResultsTable');
    if (!tableBody) return;
    
    const sortedParties = getSortedParties();
    const totalVotes = getTotalVotes();
    
    tableBody.innerHTML = '';
    
    sortedParties.forEach((party, index) => {
        const percentage = totalVotes > 0 ? ((party.votes / totalVotes) * 100).toFixed(1) : 0;
        const rank = index + 1;
        
        const row = document.createElement('div');
        row.className = 'table-row';
        
        row.innerHTML = `
            <div class="table-col">${rank === 1 ? '👑 1st' : rank === 2 ? '🥈 2nd' : rank === 3 ? '🥉 3rd' : rank + 'th'}</div>
            <div class="table-col"><strong>${party.name}</strong></div>
            <div class="table-col">${party.leader}</div>
            <div class="table-col"><strong>${party.votes}</strong></div>
            <div class="table-col">${percentage}%</div>
        `;
        
        tableBody.appendChild(row);
    });
}

function logoutAdmin() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin-login.html';
}

function unlockVoting() {
    if (confirm('Are you sure you want to unlock voting? This will allow users to vote again.')) {
        const data = getVotingData();
        data.hasVoted = false;
        data.votedParty = null;
        updateVotingData(data);
        
        alert('Voting has been unlocked successfully!');
        initAdminDashboard();
    }
}

function showResetConfirmation() {
    document.getElementById('resetModal').classList.add('active');
    document.getElementById('resetConfirmInput').value = '';
}

function closeResetModal() {
    document.getElementById('resetModal').classList.remove('active');
}

function confirmReset() {
    const input = document.getElementById('resetConfirmInput').value;
    
    if (input === 'RESET') {
        // Reset all data
        const initialData = {
            votes: {},
            hasVoted: false,
            votedParty: null,
            timestamp: null
        };
        
        politicalParties.forEach(party => {
            initialData.votes[party.id] = 0;
        });
        
        updateVotingData(initialData);
        
        closeResetModal();
        alert('System has been reset successfully!');
        initAdminDashboard();
    } else {
        alert('Please type RESET to confirm');
    }
}

// ===================================
// INITIALIZATION
// ===================================

// Initialize data on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    
    // Check which page we're on and initialize accordingly
    if (document.getElementById('partiesGrid')) {
        renderPartyCards();
    }
    
    if (document.getElementById('votesChart')) {
        initResults();
    }
    
    if (document.getElementById('adminResultsTable')) {
        initAdminDashboard();
    }
});

// Auto-refresh results page every 5 seconds
if (window.location.pathname.includes('results.html')) {
    setInterval(() => {
        if (typeof initResults === 'function') {
            initResults();
        }
    }, 5000);
}

// Auto-refresh admin dashboard every 5 seconds
if (window.location.pathname.includes('admin.html')) {
    setInterval(() => {
        if (typeof initAdminDashboard === 'function') {
            initAdminDashboard();
        }
    }, 5000);
}