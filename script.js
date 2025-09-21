/**
 * Main PomodoroApp Class - Coordinates all components
 * Uses Timer, Settings, Display, Notifications, and SessionManager components
 */
class PomodoroApp {
    constructor() {
        // Initialize components
        this.timer = new Timer();
        this.settings = new Settings();
        this.display = new Display();
        this.notifications = new Notifications();
        this.sessionManager = new SessionManager();

        // Initialize the app
        this.initialize();
    }

    /**
     * Initialize the application
     */
    initialize() {
        // Setup component interconnections
        this.setupComponentCallbacks();
        
        // Initialize components with settings
        this.sessionManager.initialize(this.settings.getSettings());
        
        // Setup event listeners
        this.initializeEventListeners();
        
        // Set initial timer duration
        const initialDuration = this.sessionManager.getCurrentSessionDuration();
        this.timer.setDuration(initialDuration);
        
        // Update display
        this.updateAllDisplays();
        
        // Request notification permission
        this.notifications.requestPermission();
    }

    /**
     * Setup callbacks between components
     */
    setupComponentCallbacks() {
        // Timer callbacks
        this.timer.onTick = (currentTime) => {
            this.updateAllDisplays();
        };

        this.timer.onComplete = () => {
            this.handleSessionComplete();
        };

        // Settings callbacks
        this.settings.onSettingsChange = (newSettings) => {
            this.handleSettingsChange(newSettings);
        };

        // Session manager callbacks
        this.sessionManager.onSessionChange = (sessionType, sessionInfo) => {
            this.handleSessionChange(sessionInfo);
        };

        this.sessionManager.onSessionComplete = (sessionInfo) => {
            this.handleSessionTransition(sessionInfo);
        };
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Control buttons
        const playPauseBtn = document.getElementById('play-pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        const skipBtn = document.getElementById('skip-btn');

        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => this.toggleTimer());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetTimer());
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipSession());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.toggleTimer();
            } else if (e.code === 'KeyR' && e.ctrlKey) {
                e.preventDefault();
                this.resetTimer();
            } else if (e.code === 'KeyS' && e.ctrlKey) {
                e.preventDefault();
                this.skipSession();
            }
        });

        // Prevent spacebar from scrolling
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
            }
        });

        // Resume audio context on first user interaction
        document.addEventListener('click', () => {
            this.notifications.resumeAudioContext();
        }, { once: true });
    }

    /**
     * Toggle timer between start and pause
     */
    toggleTimer() {
        this.timer.toggle();
        this.updateAllDisplays();
    }

    /**
     * Start the timer
     */
    startTimer() {
        this.timer.start();
        this.updateAllDisplays();
    }

    /**
     * Pause the timer
     */
    pauseTimer() {
        this.timer.pause();
        this.updateAllDisplays();
    }

    /**
     * Reset the timer to current session duration
     */
    resetTimer() {
        const currentDuration = this.sessionManager.getCurrentSessionDuration();
        this.timer.reset(currentDuration);
        this.updateAllDisplays();
    }

    /**
     * Skip to the next session
     */
    skipSession() {
        this.timer.stop();
        this.handleSessionComplete();
    }

    /**
     * Handle session completion
     */
    handleSessionComplete() {
        const currentSessionInfo = this.sessionManager.getCurrentSessionInfo();
        
        // Play completion sound and send notification
        if (this.settings.getSetting('enableSounds')) {
            this.notifications.playSound('completion');
        }

        if (this.settings.getSetting('enableNotifications')) {
            this.notifications.notifySessionComplete(currentSessionInfo.type);
        }

        // Complete the session and get next session info
        const sessionInfo = this.sessionManager.completeSession();
        
        // Set timer for next session
        this.timer.setDuration(sessionInfo.duration);
        
        // Update displays
        this.updateAllDisplays();

        // Auto-start next session if enabled
        if (sessionInfo.shouldAutoStart) {
            setTimeout(() => {
                this.timer.start();
                this.updateAllDisplays();
                
                // Notify about session start
                if (this.settings.getSetting('enableNotifications')) {
                    this.notifications.notifySessionStart(sessionInfo.currentSession);
                }
            }, 1000);
        }
    }

    /**
     * Handle session change
     */
    handleSessionChange(sessionInfo) {
        this.updateAllDisplays();
    }

    /**
     * Handle session transition
     */
    handleSessionTransition(sessionInfo) {
        // This is called when a session completes
        // Additional logic can be added here if needed
    }

    /**
     * Handle settings change
     */
    handleSettingsChange(newSettings) {
        // Update session manager with new settings
        this.sessionManager.updateSettings(newSettings);
        
        // Update notifications settings
        this.notifications.setNotificationsEnabled(newSettings.enableNotifications);
        this.notifications.setSoundEnabled(newSettings.enableSounds);
        
        // If timer is not running, update duration for current session
        if (!this.timer.getState().isRunning) {
            const newDuration = this.sessionManager.getCurrentSessionDuration();
            this.timer.setDuration(newDuration);
            this.updateAllDisplays();
        }
    }

    /**
     * Update all display elements
     */
    updateAllDisplays() {
        const timerState = this.timer.getState();
        const sessionInfo = this.sessionManager.getCurrentSessionInfo();
        const statistics = this.sessionManager.getStatistics();

        // Update display component
        this.display.updateAll({
            currentTime: timerState.currentTime,
            totalDuration: sessionInfo.duration,
            sessionType: sessionInfo.type,
            completedPomodoros: statistics.completedPomodoros,
            isRunning: timerState.isRunning
        });
    }

    /**
     * Get current app state for debugging
     */
    getState() {
        return {
            timer: this.timer.getState(),
            session: this.sessionManager.getCurrentSessionInfo(),
            statistics: this.sessionManager.getStatistics(),
            settings: this.settings.getSettings(),
            notifications: this.notifications.getSettings()
        };
    }

    /**
     * Reset the entire application
     */
    resetApp() {
        this.timer.stop();
        this.sessionManager.resetToDefaults();
        this.sessionManager.resetCounters();
        
        const initialDuration = this.sessionManager.getCurrentSessionDuration();
        this.timer.setDuration(initialDuration);
        
        this.updateAllDisplays();
    }

    /**
     * Get app statistics
     */
    getStatistics() {
        return this.sessionManager.getStatistics();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroApp = new PomodoroApp();
});