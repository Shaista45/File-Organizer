// Application State
let appState = {
    selectedPath: '',
    isOrganizing: false,
    isDarkMode: false,
    hasOrganized: false,
    organizationStats: []
};

// Progress steps for organization process
const progressSteps = [
    'Scanning files...',
    'Analyzing file types...',
    'Creating folders...',
    'Moving files...',
    'Finalizing organization...'
];

// DOM Elements
const elements = {
    app: document.getElementById('app'),
    themeToggle: document.getElementById('themeToggle'),
    browseButton: document.getElementById('browseButton'),
    pathDisplay: document.getElementById('pathDisplay'),
    organizeButton: document.getElementById('organizeButton'),
    organizeButtonText: document.getElementById('organizeButtonText'),
    summarySection: document.getElementById('summarySection'),
    summaryDescription: document.getElementById('summaryDescription'),
    statsGrid: document.getElementById('statsGrid'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    toastClose: document.getElementById('toastClose'),
    confirmModal: document.getElementById('confirmModal'),
    confirmMessage: document.getElementById('confirmMessage'),
    cancelButton: document.getElementById('cancelButton'),
    confirmButton: document.getElementById('confirmButton'),
    progressModal: document.getElementById('progressModal'),
    progressStep: document.getElementById('progressStep'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText')
};

// Category color mapping
const categoryColors = {
    'PDFs': '#ef4444',
    'Images': '#3b82f6',
    'Documents': '#10b981',
    'Music': '#8b5cf6',
    'Videos': '#f59e0b',
    'Archives': '#1efa17ff',
    'Others': '#16078bff'
};

// Initialize Application
function initializeApp() {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Bind event listeners
    bindEventListeners();

    // Update UI
    updateUI();
}

// Event Listeners
function bindEventListeners() {
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.browseButton.addEventListener('click', handleBrowseFolder);
    elements.organizeButton.addEventListener('click', handleOrganizeFiles);
    elements.toastClose.addEventListener('click', hideToast);
    elements.cancelButton.addEventListener('click', hideConfirmModal);
    elements.confirmButton.addEventListener('click', confirmOrganization);

    // Close modals when clicking outside
    elements.confirmModal.addEventListener('click', (e) => {
        if (e.target === elements.confirmModal) {
            hideConfirmModal();
        }
    });

    elements.progressModal.addEventListener('click', (e) => {
        if (e.target === elements.progressModal) {
            // Don't allow closing progress modal by clicking outside
        }
    });
}

// Theme Management
function toggleTheme() {
    const newTheme = appState.isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
}

function setTheme(theme) {
    appState.isDarkMode = theme === 'dark';
    elements.app.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    
    if (theme === 'dark') {
        document.body.style.background = 'linear-gradient(135deg, #232526 0%, #414345 100%)';
        document.body.style.color = '#e0e7ef';
        elements.app.style.boxShadow = '0 4px 32px rgba(0,0,0,0.7)';
        elements.app.style.background = 'rgba(34, 40, 49, 0.95)';
    } else {
        document.body.style.background = '';
        document.body.style.color = '';
        elements.app.style.boxShadow = '';
        elements.app.style.background = '';
    }
}

// Folder Selection
function handleBrowseFolder() {
    // Use file input for folder selection
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.style.display = "none";
    input.addEventListener("change", function (event) {
        const files = event.target.files;
        if (files.length > 0) {
            const folderName = files[0].webkitRelativePath.split('/')[0];
            appState.selectedPath = folderName;
            appState.selectedFiles = Array.from(files);
            updateUI();
        }
    });
    document.body.appendChild(input);
    input.click();
    setTimeout(() => document.body.removeChild(input), 1000);
}

// File Organization
function handleOrganizeFiles() {
    if (!appState.selectedPath) {
        showToast('Please select a folder first', 'error');
        return;
    }

    if (appState.isOrganizing) {
        return;
    }

    showConfirmModal();
}

function confirmOrganization() {
    hideConfirmModal();
    startOrganization();
}

async function startOrganization() {
    appState.isOrganizing = true;
    updateUI();

    showProgressModal();

    // Simulate organization process
    await simulateOrganizationProcess();

    // Get stats based on selected files
    const stats = getOrganizationStats(appState.selectedFiles || []);

    hideProgressModal();

    // Complete organization
    appState.isOrganizing = false;
    appState.hasOrganized = true;
    appState.organizationStats = stats;

    updateUI();

    const totalFiles = appState.organizationStats.reduce((sum, stat) => sum + stat.count, 0);
    showToast(`Successfully organized ${totalFiles} files!`, 'success');
}

async function simulateOrganizationProcess() {
    const totalDuration = 3000; // 3 seconds
    const stepDuration = totalDuration / 100;

    for (let progress = 0; progress <= 100; progress += 2) {
        // Update progress step
        const stepIndex = Math.floor((progress / 100) * (progressSteps.length - 1));
        elements.progressStep.textContent = progressSteps[stepIndex];

        // Update progress bar
        elements.progressFill.style.width = `${progress}%`;
        elements.progressText.textContent = `${progress}% Complete`;

        // Wait for next update
        await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
}

// Get organization stats based on selected files
function getOrganizationStats(files) {
    // File extension to category mapping
    const extMap = {
        'pdf': 'PDFs',
        'jpg': 'Images', 'jpeg': 'Images', 'png': 'Images', 'gif': 'Images', 'bmp': 'Images', 'svg': 'Images',
        'doc': 'Documents', 'docx': 'Documents', 'txt': 'Documents', 'xls': 'Documents', 'xlsx': 'Documents', 'ppt': 'Documents', 'pptx': 'Documents',
        'mp3': 'Music', 'wav': 'Music', 'flac': 'Music', 'aac': 'Music', 'ogg': 'Music', 'm4a': 'Music',
        'mp4': 'Videos', 'avi': 'Videos', 'mov': 'Videos', 'wmv': 'Videos', 'mkv': 'Videos', 'webm': 'Videos',
        'zip': 'Archives', 'rar': 'Archives', '7z': 'Archives', 'tar': 'Archives', 'gz': 'Archives'
    };

    const statsMap = {};
    let totalFiles = 0;

    files.forEach(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        const category = extMap[ext] || 'Others';
        statsMap[category] = (statsMap[category] || 0) + 1;
        totalFiles++;
    });

    // Build stats array with colors
    const stats = Object.keys(statsMap).map(category => ({
        category,
        count: statsMap[category],
        color: categoryColors[category] || categoryColors['Others']
    }));

    return stats;
}

// UI Updates
function updateUI() {
    updatePathDisplay();
    updateOrganizeButton();
    updateSummarySection();
}

function updatePathDisplay() {
    if (appState.selectedPath) {
        elements.pathDisplay.textContent = appState.selectedPath;
        elements.pathDisplay.classList.add('has-path');
    } else {
        elements.pathDisplay.textContent = 'No folder selected';
        elements.pathDisplay.classList.remove('has-path');
    }
}

function updateOrganizeButton() {
    const hasPath = !!appState.selectedPath;
    const isOrganizing = appState.isOrganizing;

    elements.organizeButton.disabled = !hasPath || isOrganizing;

    if (isOrganizing) {
        elements.organizeButton.classList.add('organizing');
        elements.organizeButtonText.textContent = 'Organizing Files...';
    } else {
        elements.organizeButton.classList.remove('organizing');
        elements.organizeButtonText.textContent = 'Organize Files';
    }
}

function updateSummarySection() {
    if (appState.hasOrganized && appState.organizationStats.length > 0) {
        elements.summarySection.style.display = 'block';

        const totalFiles = appState.organizationStats.reduce((sum, stat) => sum + stat.count, 0);
        const totalCategories = appState.organizationStats.length;

        elements.summaryDescription.textContent =
            `Successfully organized ${totalFiles} files into ${totalCategories} categories`;

        renderStatsGrid();
    } else {
        elements.summarySection.style.display = 'none';
    }
}

function renderStatsGrid() {
    elements.statsGrid.innerHTML = '';

    appState.organizationStats.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';

        statCard.innerHTML = `
            <div class="stat-header">
                <div class="stat-indicator" style="background-color: ${stat.color}"></div>
                <span class="stat-category">${stat.category}</span>
            </div>
            <div class="stat-count">${stat.count}</div>
            <div class="stat-label">files moved</div>
        `;

        elements.statsGrid.appendChild(statCard);
    });
}

// Modal Management
function showConfirmModal() {
    elements.confirmMessage.textContent =
        `Are you sure you want to organize all files in "${appState.selectedPath}"? This action will move files into categorized subfolders.`;
    elements.confirmModal.classList.add('show');
}

function hideConfirmModal() {
    elements.confirmModal.classList.remove('show');
}

function showProgressModal() {
    elements.progressModal.classList.add('show');
    // Reset progress
    elements.progressFill.style.width = '0%';
    elements.progressText.textContent = '0% Complete';
    elements.progressStep.textContent = progressSteps[0];
}

function hideProgressModal() {
    elements.progressModal.classList.remove('show');
}

// Toast Notifications
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('show');

    // Auto-hide after 4 seconds
    setTimeout(() => {
        hideToast();
    }, 4000);
}

function hideToast() {
    elements.toast.classList.remove('show');
}

// Utility Functions
function formatNumber(num) {
    return num.toLocaleString();
}

function getRandomDelay(min = 50, max = 150) {
    return Math.random() * (max - min) + min;
}

// Error Handling
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    showToast('An unexpected error occurred', 'error');
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause any ongoing operations if needed
    } else {
        // Page is visible, resume operations if needed
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Escape key to close modals
    if (event.key === 'Escape') {
        if (elements.confirmModal.classList.contains('show')) {
            hideConfirmModal();
        }
        if (elements.toast.classList.contains('show')) {
            hideToast();
        }
    }

    // Ctrl/Cmd + O to browse folder
    if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
        event.preventDefault();
        handleBrowseFolder();
    }

    // Enter to organize files (when button is enabled)
    if (event.key === 'Enter' && !elements.organizeButton.disabled) {
        handleOrganizeFiles();
    }

    // Ctrl/Cmd + D to toggle dark mode
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        toggleTheme();
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        setTheme,
        handleBrowseFolder,
        handleOrganizeFiles
    };
}



