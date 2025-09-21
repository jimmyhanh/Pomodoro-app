/**
 * Timer Component - Handles core timer functionality
 * Manages time counting, start/pause/reset operations
 */
class Timer {
    constructor() {
        this.currentTime = 0; // in seconds
        this.isRunning = false;
        this.isPaused = false;
        this.timer = null;
        this.onTick = null; // callback for each second
        this.onComplete = null; // callback when timer reaches 0
    }

    /**
     * Set the timer duration
     * @param {number} seconds - Duration in seconds
     */
    setDuration(seconds) {
        if (!this.isRunning) {
            this.currentTime = seconds;
        }
    }

    /**
     * Start the timer
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        this.timer = setInterval(() => {
            this.currentTime--;
            
            // Call tick callback if provided
            if (this.onTick) {
                this.onTick(this.currentTime);
            }
            
            // Check if timer completed
            if (this.currentTime <= 0) {
                this.complete();
            }
        }, 1000);
    }

    /**
     * Pause the timer
     */
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.isPaused = true;
        clearInterval(this.timer);
    }

    /**
     * Reset the timer to the original duration
     * @param {number} seconds - Duration to reset to
     */
    reset(seconds) {
        this.stop();
        this.currentTime = seconds;
        this.isPaused = false;
    }

    /**
     * Stop the timer completely
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timer);
    }

    /**
     * Complete the timer (reached 0)
     */
    complete() {
        this.stop();
        
        // Call complete callback if provided
        if (this.onComplete) {
            this.onComplete();
        }
    }

    /**
     * Toggle between start and pause
     */
    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    /**
     * Get current time in seconds
     * @returns {number} Current time in seconds
     */
    getCurrentTime() {
        return this.currentTime;
    }

    /**
     * Get current timer state
     * @returns {object} Timer state object
     */
    getState() {
        return {
            currentTime: this.currentTime,
            isRunning: this.isRunning,
            isPaused: this.isPaused
        };
    }

    /**
     * Format time in MM:SS format
     * @param {number} timeInSeconds - Time to format
     * @returns {string} Formatted time string
     */
    static formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Convert minutes to seconds
     * @param {number} minutes - Minutes to convert
     * @returns {number} Seconds
     */
    static minutesToSeconds(minutes) {
        return minutes * 60;
    }
}

// Export for module usage or make globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Timer;
} else {
    window.Timer = Timer;
}