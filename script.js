/* ===================================
   VOTING SYSTEM - FIREBASE VERSION
   Educational/Demo Purpose Only
   =================================== */

// ===================================
// FIREBASE CONFIGURATION
// ===================================

// TODO: Replace with your Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyAv8bamyrsoCdLdPR63CN2qlH_SwD8xMEo",
  authDomain: "fir-voting-system-fb1b8.firebaseapp.com",
  databaseURL: "https://fir-voting-system-fb1b8-default-rtdb.firebaseio.com",
  projectId: "fir-voting-system-fb1b8",
  storageBucket: "fir-voting-system-fb1b8.firebasestorage.app",
  messagingSenderId: "260352762458",
  appId: "1:260352762458:web:0b0ab7cb46156c89f4ee63",
  measurementId: "G-TE2HRKJQCQ"
};

// Initialize Firebase
let database;
let votesRef;

function initializeFirebase() {
    try {
        // Initialize Firebase App
        firebase.initializeApp(firebaseConfig);
        
        // Get database reference
        database = firebase.database();
        votesRef = database.ref('votes');
        
        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        alert('Firebase connection error. Please check your configuration.');
        return false;
    }
}

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
// FIREBASE FUNCTIONS - VOTES
// ===================================

/**
 * Initialize vote counts for all parties in Firebase
 * Creates the structure if it doesn't exist
 */
async function initializeVoteCounts() {
    try {
        const snapshot = await votesRef.once('value');
        const data = snapshot.val();
        
        // If no data exists, initialize with zero votes
        if (!data) {
            const initialVotes = {};
            politicalParties.forEach(party => {
                initialVotes[party.id] = 0;
            });
            await votesRef.set(initialVotes);
            console.log('✅ Vote counts initialized in Firebase');
        }
    } catch (error) {
        console.error('❌ Error initializing vote counts:', error);
    }
}

/**
 * Add a vote to a specific party in Firebase
 * @param {string} partyId - The ID of the party to vote for
 * @returns {Promise<boolean>} - Success status
 */
async function addVote(partyId) {
    try {
        // Get current vote count
        const partyRef = votesRef.child(partyId);
        const snapshot = await partyRef.once('value');
        const currentVotes = snapshot.val() || 0;
        
        // Increment vote count
        await partyRef.set(currentVotes + 1);
        
        console.log(`✅ Vote added for ${partyId}. New count: ${currentVotes + 1}`);
        return true;
    } catch (error) {
        console.error('❌ Error adding vote:', error);
        return false;
    }
}

/**
 * Get all vote counts from Firebase
 * @returns {Promise<Object>} - Object with party IDs and vote counts
 */
async function getAllVotes() {
    try {
        const snapshot = await votesRef.once('value');
        const votes = snapshot.val() || {};
        console.log('✅ Votes retrieved from Firebase:', votes);
        return votes;
    } catch (error) {
        console.error('❌ Error getting votes:', error);
        return {};
    }
}

/**
 * Listen for real-time updates to vote counts
 * @param {Function} callback - Function to call when data changes
 */
function listenToVoteUpdates(callback) {
    votesRef.on('value', (snapshot) => {
        const votes = snapshot.val() || {};
        console.log('🔄 Real-time update received:', votes);
        callback(votes);
    });
}

/**
 * Stop listening to vote updates
 */
function stopListeningToVotes() {
    votesRef.off('value');
    console.log('🛑 Stopped listening to vote updates');
}

/**
 * Reset all votes to zero in Firebase
 * @returns {Promise<boolean>} - Success status
 */
async function resetAllVotes() {
    try {
        const resetVotes = {};
        politicalParties.forEach(party => {
            resetVotes[party.id] = 0;
        });
        await votesRef.set(resetVotes);
        console.log('✅ All votes reset successfully');
        return true;
    } catch (error) {
        console.error('❌ Error resetting votes:', error);
        return false;
    }
}

/**
 * Get vote count for a specific party
 * @param {string} partyId - The ID of the party
 * @returns {Promise<number>} - Vote count
 */
async function getVoteCount(partyId) {
    try {
        const snapshot = await votesRef.child(partyId).once('value');
        return snapshot.val() || 0;
    } catch (error) {
        console.error('❌ Error getting vote count:', error);
        return 0;
    }
}

// ===================================
// LOCAL STORAGE - USER VOTING STATUS
// ===================================

/**
 * Check if user has already voted (stored locally)
 * @returns {boolean}
 */
function hasUserVoted() {
    return localStorage.getItem('hasVoted') === 'true';
}

/**
 * Get which party user voted for (stored locally)
 * @returns {string|null}
 */
function getUserVotedParty() {
    return localStorage.getItem('votedParty');
}

/**
 * Mark user as having voted (stored locally)
 * @param {string} partyId - The ID of the party voted for
 */
function markUserAsVoted(partyId) {
    localStorage.setItem('hasVoted', 'true');
    localStorage.setItem('votedParty', partyId);
    localStorage.setItem('voteTimestamp', new Date().toISOString());
}

/**
 * Unlock voting for user (remove local lock)
 */
function unlockUserVoting() {
    localStorage.removeItem('hasVoted');
    localStorage.removeItem('votedParty');
    localStorage.removeItem('voteTimestamp');
    console.log('✅ User voting unlocked locally');
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Get total votes across all parties
 * @param {Object} votes - Votes object from Firebase
 * @returns {number}
 */
function getTotalVotes(votes) {
    return Object.values(votes).reduce((sum, count) => sum + count, 0);
}

/**
 * Get sorted parties by votes
 * @param {Object} votes - Votes object from Firebase
 * @returns {Array}
 */
function getSortedParties(votes) {
    return politicalParties
        .map(party => ({
            ...party,
            votes: votes[party.id] || 0
        }))
        .sort((a, b) => b.votes - a.votes);
}

// ===================================
// VOTING PAGE FUNCTIONS
// ===================================

/**
 * Render party cards on voting page
 */
async function renderPartyCards() {
    const grid = document.getElementById('partiesGrid');
    if (!grid) return;
    
    const hasVoted = hasUserVoted();
    const votedParty = getUserVotedParty();
    
    // Get current votes from Firebase
    const votes = await getAllVotes();
    
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
                    (votedParty === party.id ? 
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

/**
 * Update voting status message
 */
function updateVotingStatus() {
    const statusDiv = document.getElementById('votingStatus');
    if (!statusDiv) return;
    
    const hasVoted = hasUserVoted();
    
    if (hasVoted) {
        const votedPartyId = getUserVotedParty();
        const votedParty = politicalParties.find(p => p.id === votedPartyId);
        statusDiv.innerHTML = `✓ You have already voted for ${votedParty ? votedParty.name : 'a party'}`;
        statusDiv.style.background = 'var(--color-success-light)';
        statusDiv.style.color = 'var(--color-success)';
    } else {
        statusDiv.innerHTML = '● Voting is open - Choose your party';
        statusDiv.style.background = 'var(--color-primary-light)';
        statusDiv.style.color = 'var(--color-primary)';
    }
}

// ===================================
// MODAL FUNCTIONS
// ===================================

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

function closeModal() {
    selectedPartyId = null;
    document.getElementById('confirmModal').classList.remove('active');
}

/**
 * Confirm and submit vote to Firebase
 */
async function confirmVote() {
    if (!selectedPartyId) return;
    
    // Show loading state
    const confirmBtn = event.target;
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = 'Submitting...';
    confirmBtn.disabled = true;
    
    try {
        // Add vote to Firebase
        const success = await addVote(selectedPartyId);
        
        if (success) {
            // Mark user as voted locally
            markUserAsVoted(selectedPartyId);
            
            // Close confirm modal
            closeModal();
            
            // Show success modal
            showSuccessModal();
            
            // Re-render cards
            await renderPartyCards();
        } else {
            alert('Failed to submit vote. Please try again.');
            confirmBtn.textContent = originalText;
            confirmBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error submitting vote:', error);
        alert('An error occurred. Please try again.');
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
    }
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.add('active');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
    window.location.href = 'results.html';
}

// ===================================
// RESULTS PAGE FUNCTIONS
// ===================================

/**
 * Animate counter
 */
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

/**
 * Initialize results page with real-time updates
 */
function initResults() {
    console.log('📊 Initializing results page...');
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js not loaded! Make sure the script is included in HTML.');
        const chartWrapper = document.querySelector('.chart-wrapper');
        if (chartWrapper) {
            chartWrapper.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">Chart.js failed to load. Please check your internet connection and refresh the page.</div>';
        }
        return;
    }
    
    console.log('✅ Chart.js loaded successfully');
    
    // Listen for real-time vote updates
    listenToVoteUpdates((votes) => {
        console.log('🔄 Updating results display...');
        updateResultsDisplay(votes);
    });
}

/**
 * Update all results display elements
 * @param {Object} votes - Votes object from Firebase
 */
function updateResultsDisplay(votes) {
    console.log('📊 Updating results display with votes:', votes);
    
    const totalVotes = getTotalVotes(votes);
    const sortedParties = getSortedParties(votes);
    const leadingParty = sortedParties[0];
    
    console.log('Total votes:', totalVotes);
    console.log('Sorted parties:', sortedParties);
    
    // Update stats
    const totalVotesEl = document.getElementById('totalVotes');
    if (totalVotesEl) {
        totalVotesEl.textContent = totalVotes;
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
    renderRankings(votes);
    
    // Render chart
    console.log('📈 Rendering chart...');
    renderChart(votes);
}

/**
 * Render rankings grid
 */
function renderRankings(votes) {
    const grid = document.getElementById('rankingsGrid');
    if (!grid) return;
    
    const sortedParties = getSortedParties(votes);
    const totalVotes = getTotalVotes(votes);
    
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
    });
}

/**
 * Render chart using Chart.js
 */
function renderChart(votes) {
    const canvas = document.getElementById('votesChart');
    if (!canvas) return;
    
    const sortedParties = getSortedParties(votes);
    const totalVotes = getTotalVotes(votes);
    
    // Log for debugging
    console.log('📊 Rendering chart with data:', sortedParties);
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.votesChart && typeof window.votesChart.destroy === 'function') {
        window.votesChart.destroy();
    }
    
    // Create new chart
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
                duration: 750,
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
                            const percentage = totalVotes > 0 ? ((context.raw / totalVotes) * 100).toFixed(1) : 0;
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
                        },
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    });
    
    console.log('✅ Chart rendered successfully');
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
    if (username === 'admin' && password === 'admin123') {
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

/**
 * Initialize admin dashboard with real-time updates
 */
function initAdminDashboard() {
    // Listen for real-time vote updates
    listenToVoteUpdates((votes) => {
        updateAdminDisplay(votes);
    });
}

/**
 * Update admin dashboard display
 */
function updateAdminDisplay(votes) {
    const totalVotes = getTotalVotes(votes);
    const sortedParties = getSortedParties(votes);
    const leadingParty = sortedParties[0];
    const hasVoted = hasUserVoted();
    
    // Update stats
    const totalVotesEl = document.getElementById('adminTotalVotes');
    if (totalVotesEl) {
        totalVotesEl.textContent = totalVotes;
    }
    
    const leadingPartyEl = document.getElementById('adminLeadingParty');
    if (leadingPartyEl) {
        leadingPartyEl.textContent = leadingParty ? leadingParty.name : 'No votes yet';
    }
    
    const statusEl = document.getElementById('votingStatusText');
    if (statusEl) {
        statusEl.textContent = hasVoted ? 'Locked' : 'Active';
        statusEl.style.color = hasVoted ? 'var(--color-warning)' : 'var(--color-success)';
    }
    
    // Render results table
    renderAdminResultsTable(votes);
}

/**
 * Render admin results table
 */
function renderAdminResultsTable(votes) {
    const tableBody = document.getElementById('adminResultsTable');
    if (!tableBody) return;
    
    const sortedParties = getSortedParties(votes);
    const totalVotes = getTotalVotes(votes);
    
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

/**
 * Unlock voting for all users (clears local storage lock)
 */
function unlockVoting() {
    if (confirm('Are you sure you want to unlock voting? This will allow users to vote again from their browsers.')) {
        unlockUserVoting();
        alert('Voting has been unlocked for your browser. Other users must clear their own browser data.');
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

/**
 * Confirm and reset all votes in Firebase
 */
async function confirmReset() {
    const input = document.getElementById('resetConfirmInput').value;
    
    if (input === 'RESET') {
        // Show loading
        const resetBtn = event.target;
        const originalText = resetBtn.textContent;
        resetBtn.textContent = 'Resetting...';
        resetBtn.disabled = true;
        
        try {
            // Reset all votes in Firebase
            const success = await resetAllVotes();
            
            if (success) {
                closeResetModal();
                alert('System has been reset successfully! All votes cleared from Firebase.');
                // Dashboard will update automatically via real-time listener
            } else {
                alert('Failed to reset votes. Please try again.');
            }
        } catch (error) {
            console.error('Error resetting votes:', error);
            alert('An error occurred. Please try again.');
        } finally {
            resetBtn.textContent = originalText;
            resetBtn.disabled = false;
        }
    } else {
        alert('Please type RESET to confirm');
    }
}

// ===================================
// INITIALIZATION
// ===================================

/**
 * Main initialization function
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing Voting System...');
    
    // Initialize Firebase
    const firebaseReady = initializeFirebase();
    
    if (!firebaseReady) {
        console.error('❌ Firebase not initialized. Please check configuration.');
        return;
    }
    
    // Initialize vote counts in Firebase
    await initializeVoteCounts();
    
    // Check which page we're on and initialize accordingly
    if (document.getElementById('partiesGrid')) {
        console.log('📄 Loading voting page...');
        await renderPartyCards();
    }
    
    if (document.getElementById('votesChart')) {
        console.log('📊 Loading results page...');
        initResults();
    }
    
    if (document.getElementById('adminResultsTable')) {
        console.log('🔧 Loading admin dashboard...');
        initAdminDashboard();
    }
    
    console.log('✅ System ready!');
});

// Cleanup listeners when leaving results or admin pages
window.addEventListener('beforeunload', function() {
    if (document.getElementById('votesChart') || document.getElementById('adminResultsTable')) {
        stopListeningToVotes();
    }
});