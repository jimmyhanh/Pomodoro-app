/**
 * SessionManager Component - Handles session logic and state management
 * Manages work/break cycles, session counting, and auto-start functionality
 */
class SessionManager {
    constructor(settings) {
        this.settings = settings || {};
        this.currentSession = 'work';
        this.sessionCount = 0;
        this.completedPomodoros = 0;
        
        // Callbacks
        this.onSessionChange = null;
        this.onSessionComplete = null;
        this.onCounterUpdate = null;

        // Session types
        this.sessionTypes = {
            WORK: 'work',
            SHORT_BREAK: 'shortBreak',
            LONG_BREAK: 'longBreak'
        };
    }

    /**
     * Initialize the session manager with settings
     * @param {object} settings - Settings object
     */
    initialize(settings) {
        this.settings = settings;
        this.resetToDefaults();
    }

    /**
     * Reset session manager to default state
     */
    resetToDefaults() {
        this.currentSession = this.sessionTypes.WORK;
        this.sessionCount = 0;
        this.completedPomodoros = 0;
    }

    /**
     * Get the duration for a specific session type
     * @param {string} sessionType - Session type
     * @returns {number} Duration in seconds
     */
    getSessionDuration(sessionType) {
        const durations = {
            [this.sessionTypes.WORK]: (this.settings.workDuration || 25) * 60,
            [this.sessionTypes.SHORT_BREAK]: (this.settings.shortBreakDuration || 5) * 60,
            [this.sessionTypes.LONG_BREAK]: (this.settings.longBreakDuration || 15) * 60
        };

        return durations[sessionType] || durations[this.sessionTypes.WORK];
    }

    /**
     * Get the current session duration
     * @returns {number} Current session duration in seconds
     */
    getCurrentSessionDuration() {
        return this.getSessionDuration(this.currentSession);
    }

    /**
     * Complete the current session and determine the next session
     * @returns {object} Information about the session transition
     */
    completeSession() {
        const previousSession = this.currentSession;
        let nextSession;

        // Determine next session based on current session
        if (this.currentSession === this.sessionTypes.WORK) {
            this.completedPomodoros++;
            this.sessionCount++;
            
            // Check if it's time for a long break
            const sessionsUntilLongBreak = this.settings.sessionsUntilLongBreak || 4;
            if (this.sessionCount % sessionsUntilLongBreak === 0) {
                nextSession = this.sessionTypes.LONG_BREAK;
            } else {
                nextSession = this.sessionTypes.SHORT_BREAK;
            }
        } else {
            // After any break, return to work
            nextSession = this.sessionTypes.WORK;
        }

        this.currentSession = nextSession;

        const sessionInfo = {
            previousSession,
            currentSession: this.currentSession,
            completedPomodoros: this.completedPomodoros,
            sessionCount: this.sessionCount,
            duration: this.getCurrentSessionDuration(),
            shouldAutoStart: this.shouldAutoStart()
        };

        // Call callbacks
        if (this.onSessionComplete) {
            this.onSessionComplete(sessionInfo);
        }

        if (this.onSessionChange) {
            this.onSessionChange(this.currentSession, sessionInfo);
        }

        if (this.onCounterUpdate) {
            this.onCounterUpdate(this.completedPomodoros);
        }

        return sessionInfo;
    }

    /**
     * Skip to the next session without completing the current one
     * @returns {object} Information about the session transition
     */
    skipSession() {
        return this.completeSession();
    }

    /**
     * Determine if the next session should auto-start
     * @returns {boolean} Whether to auto-start the next session
     */
    shouldAutoStart() {
        const isBreakSession = this.currentSession !== this.sessionTypes.WORK;
        const isWorkSession = this.currentSession === this.sessionTypes.WORK;

        return (
            (isBreakSession && this.settings.autoStartBreaks) ||
            (isWorkSession && this.settings.autoStartPomodoros)
        );
    }

    /**
     * Get current session information
     * @returns {object} Current session data
     */
    getCurrentSessionInfo() {
        return {
            type: this.currentSession,
            duration: this.getCurrentSessionDuration(),
            completedPomodoros: this.completedPomodoros,
            sessionCount: this.sessionCount,
            isWork: this.currentSession === this.sessionTypes.WORK,
            isBreak: this.currentSession !== this.sessionTypes.WORK,
            isLongBreak: this.currentSession === this.sessionTypes.LONG_BREAK
        };
    }

    /**
     * Get session statistics
     * @returns {object} Session statistics
     */
    getStatistics() {
        const sessionsUntilLongBreak = this.settings.sessionsUntilLongBreak || 4;
        const sessionsUntilNextLongBreak = sessionsUntilLongBreak - (this.sessionCount % sessionsUntilLongBreak);

        return {
            completedPomodoros: this.completedPomodoros,
            totalSessions: this.sessionCount,
            sessionsUntilLongBreak: sessionsUntilNextLongBreak === sessionsUntilLongBreak ? 0 : sessionsUntilNextLongBreak,
            currentCycle: Math.floor(this.sessionCount / sessionsUntilLongBreak) + 1,
            currentSessionInCycle: (this.sessionCount % sessionsUntilLongBreak) + 1
        };
    }

    /**
     * Reset session counters
     */
    resetCounters() {
        this.sessionCount = 0;
        this.completedPomodoros = 0;
        
        if (this.onCounterUpdate) {
            this.onCounterUpdate(this.completedPomodoros);
        }
    }

    /**
     * Set the current session type manually
     * @param {string} sessionType - Session type to set
     * @returns {boolean} Whether the session was set successfully
     */
    setCurrentSession(sessionType) {
        if (Object.values(this.sessionTypes).includes(sessionType)) {
            this.currentSession = sessionType;
            
            if (this.onSessionChange) {
                this.onSessionChange(this.currentSession, this.getCurrentSessionInfo());
            }
            
            return true;
        }
        return false;
    }

    /**
     * Get the next session type without changing the current session
     * @returns {string} Next session type
     */
    getNextSessionType() {
        if (this.currentSession === this.sessionTypes.WORK) {
            const sessionsUntilLongBreak = this.settings.sessionsUntilLongBreak || 4;
            const nextSessionCount = this.sessionCount + 1;
            
            if (nextSessionCount % sessionsUntilLongBreak === 0) {
                return this.sessionTypes.LONG_BREAK;
            } else {
                return this.sessionTypes.SHORT_BREAK;
            }
        } else {
            return this.sessionTypes.WORK;
        }
    }

    /**
     * Get session type display information
     * @param {string} sessionType - Session type (optional, uses current if not provided)
     * @returns {object} Display information for the session
     */
    getSessionDisplayInfo(sessionType = null) {
        const type = sessionType || this.currentSession;
        
        const displayInfo = {
            [this.sessionTypes.WORK]: {
                title: '🍅 Focus Time!',
                color: 'red',
                description: 'Time to focus and be productive'
            },
            [this.sessionTypes.SHORT_BREAK]: {
                title: '☕ Short Break',
                color: 'green',
                description: 'Take a quick break and recharge'
            },
            [this.sessionTypes.LONG_BREAK]: {
                title: '🎉 Long Break',
                color: 'blue',
                description: 'Enjoy a longer break - you\'ve earned it!'
            }
        };

        return displayInfo[type] || displayInfo[this.sessionTypes.WORK];
    }

    /**
     * Update settings and recalculate session information
     * @param {object} newSettings - New settings object
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    /**
     * Get session progress information
     * @returns {object} Progress information
     */
    getSessionProgress() {
        const sessionsUntilLongBreak = this.settings.sessionsUntilLongBreak || 4;
        const currentCycleProgress = this.sessionCount % sessionsUntilLongBreak;
        
        return {
            currentSessionInCycle: currentCycleProgress + 1,
            totalSessionsInCycle: sessionsUntilLongBreak,
            progressPercentage: (currentCycleProgress / sessionsUntilLongBreak) * 100,
            isLastSessionInCycle: currentCycleProgress === sessionsUntilLongBreak - 1
        };
    }

    /**
     * Check if current session is a work session
     * @returns {boolean} Whether current session is work
     */
    isWorkSession() {
        return this.currentSession === this.sessionTypes.WORK;
    }

    /**
     * Check if current session is a break session
     * @returns {boolean} Whether current session is a break
     */
    isBreakSession() {
        return this.currentSession !== this.sessionTypes.WORK;
    }

    /**
     * Export session state for persistence
     * @returns {object} Session state object
     */
    exportState() {
        return {
            currentSession: this.currentSession,
            sessionCount: this.sessionCount,
            completedPomodoros: this.completedPomodoros
        };
    }

    /**
     * Import session state from persistence
     * @param {object} state - Session state object
     */
    importState(state) {
        if (state) {
            this.currentSession = state.currentSession || this.sessionTypes.WORK;
            this.sessionCount = state.sessionCount || 0;
            this.completedPomodoros = state.completedPomodoros || 0;
            
            if (this.onCounterUpdate) {
                this.onCounterUpdate(this.completedPomodoros);
            }
        }
    }
}

// Export for module usage or make globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionManager;
} else {
    window.SessionManager = SessionManager;
}