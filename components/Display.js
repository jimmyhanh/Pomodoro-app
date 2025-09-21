/**
 * Display Component - Handles UI updates and visual feedback
 * Manages time display, progress bar, session titles, and document updates
 */
class Display {
    constructor() {
        // DOM elements
        this.timeDisplay = document.getElementById('time-display');
        this.sessionTitle = document.getElementById('session-title');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.progressBar = document.getElementById('progress-bar');
        this.sessionCounter = document.getElementById('session-counter');
        this.bodyElement = document.body;

        // Session configuration
        this.sessionTitles = {
            work: '🍅 Focus Time!',
            shortBreak: '☕ Short Break',
            longBreak: '🎉 Long Break'
        };

        // Icon SVGs
        this.playIcon = `<svg class="fill-current" xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px"><path d="M320-200v-560l440 280-440 280Z"/></svg>`;
        this.pauseIcon = `<svg class="fill-current" xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>`;
    }

    /**
     * Update the time display
     * @param {number} timeInSeconds - Current time in seconds
     */
    updateTimeDisplay(timeInSeconds) {
        if (this.timeDisplay) {
            const formatted = this.formatTime(timeInSeconds);
            this.timeDisplay.textContent = formatted;
        }
    }

    /**
     * Update the session title
     * @param {string} sessionType - Current session type ('work', 'shortBreak', 'longBreak')
     */
    updateSessionTitle(sessionType) {
        if (this.sessionTitle && this.sessionTitles[sessionType]) {
            this.sessionTitle.textContent = this.sessionTitles[sessionType];
        }
    }

    /**
     * Update the progress bar
     * @param {number} currentTime - Current remaining time in seconds
     * @param {number} totalDuration - Total session duration in seconds
     */
    updateProgressBar(currentTime, totalDuration) {
        if (this.progressBar && totalDuration > 0) {
            const progress = ((totalDuration - currentTime) / totalDuration) * 100;
            this.progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        }
    }

    /**
     * Update the session counter
     * @param {number} completedPomodoros - Number of completed pomodoro sessions
     */
    updateSessionCounter(completedPomodoros) {
        if (this.sessionCounter) {
            this.sessionCounter.textContent = `Completed: ${completedPomodoros}`;
        }
    }

    /**
     * Update the play/pause button icon
     * @param {boolean} isRunning - Whether the timer is currently running
     */
    updatePlayPauseButton(isRunning) {
        if (this.playPauseBtn) {
            this.playPauseBtn.innerHTML = isRunning ? this.pauseIcon : this.playIcon;
            this.playPauseBtn.setAttribute('aria-label', isRunning ? 'pause' : 'play');
        }
    }

    /**
     * Update the document title (browser tab)
     * @param {number} timeInSeconds - Current time in seconds
     * @param {string} sessionType - Current session type
     */
    updateDocumentTitle(timeInSeconds, sessionType) {
        const formatted = this.formatTime(timeInSeconds);
        const sessionTitle = this.sessionTitles[sessionType] || 'Pomodoro Timer';
        document.title = `${formatted} - ${sessionTitle}`;
    }

    /**
     * Update the body class for session-specific styling
     * @param {string} sessionType - Current session type
     */
    updateBodyClass(sessionType) {
        if (this.bodyElement) {
            // Remove existing session classes
            this.bodyElement.className = this.bodyElement.className.replace(/session-\w+/g, '');
            // Add new session class
            this.bodyElement.classList.add(`session-${sessionType}`);
        }
    }

    /**
     * Update all display elements at once
     * @param {object} displayData - Object containing all display data
     */
    updateAll(displayData) {
        const {
            currentTime,
            totalDuration,
            sessionType,
            completedPomodoros,
            isRunning
        } = displayData;

        this.updateTimeDisplay(currentTime);
        this.updateSessionTitle(sessionType);
        this.updateProgressBar(currentTime, totalDuration);
        this.updateSessionCounter(completedPomodoros);
        this.updatePlayPauseButton(isRunning);
        this.updateDocumentTitle(currentTime, sessionType);
        this.updateBodyClass(sessionType);
    }

    /**
     * Format time in MM:SS format
     * @param {number} timeInSeconds - Time to format
     * @returns {string} Formatted time string
     */
    formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Show a temporary status message
     * @param {string} message - Message to display
     * @param {number} duration - Duration in milliseconds
     */
    showStatusMessage(message, duration = 3000) {
        // Create or get status element
        let statusElement = document.getElementById('status-message');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'status-message';
            statusElement.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg z-50 transition-opacity duration-300';
            document.body.appendChild(statusElement);
        }

        statusElement.textContent = message;
        statusElement.style.opacity = '1';

        // Hide after duration
        setTimeout(() => {
            statusElement.style.opacity = '0';
        }, duration);
    }

    /**
     * Add visual feedback for button clicks
     * @param {HTMLElement} element - Element to animate
     */
    addClickFeedback(element) {
        if (element) {
            element.classList.add('scale-95');
            setTimeout(() => {
                element.classList.remove('scale-95');
            }, 150);
        }
    }

    /**
     * Highlight the current session section
     * @param {string} sessionType - Current session type
     */
    highlightCurrentSession(sessionType) {
        // Remove previous highlights
        document.querySelectorAll('.session-highlight').forEach(el => {
            el.classList.remove('session-highlight');
        });

        // Add highlight to current session (if there are session indicators)
        const sessionIndicator = document.querySelector(`[data-session="${sessionType}"]`);
        if (sessionIndicator) {
            sessionIndicator.classList.add('session-highlight');
        }
    }

    /**
     * Update session titles configuration
     * @param {object} titles - New session titles object
     */
    updateSessionTitles(titles) {
        this.sessionTitles = { ...this.sessionTitles, ...titles };
    }

    /**
     * Get current session title
     * @param {string} sessionType - Session type
     * @returns {string} Session title
     */
    getSessionTitle(sessionType) {
        return this.sessionTitles[sessionType] || 'Pomodoro Timer';
    }

    /**
     * Reset document title to default
     */
    resetDocumentTitle() {
        document.title = '🍅 Pomodoro Timer';
    }

    /**
     * Check if all required DOM elements are available
     * @returns {boolean} Whether all elements are found
     */
    validateElements() {
        const required = [
            'time-display',
            'session-title',
            'play-pause-btn',
            'progress-bar',
            'session-counter'
        ];

        const missing = required.filter(id => !document.getElementById(id));
        
        if (missing.length > 0) {
            console.warn('Display component missing elements:', missing);
            return false;
        }
        
        return true;
    }
}

// Export for module usage or make globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Display;
} else {
    window.Display = Display;
}