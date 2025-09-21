/**
 * Notifications Component - Handles notifications and audio feedback
 * Manages browser notifications, permission requests, and sound effects
 */
class Notifications {
    constructor() {
        this.isEnabled = true;
        this.soundEnabled = true;
        this.audioContext = null;
        
        // Notification messages
        this.sessionMessages = {
            work: '🍅 Time to focus! Work session starting.',
            shortBreak: '☕ Take a short break! You\'ve earned it.',
            longBreak: '🎉 Long break time! Great job on completing a cycle.'
        };

        this.completionMessages = {
            work: '🎉 Great work! Time for a break.',
            shortBreak: '💪 Break\'s over! Ready to focus?',
            longBreak: '🚀 Long break complete! Let\'s get back to work.'
        };

        this.initializeAudioContext();
    }

    /**
     * Initialize Web Audio Context for sound generation
     */
    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    /**
     * Request notification permission from the browser
     * @returns {Promise<string>} Permission status
     */
    async requestPermission() {
        if ('Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                this.isEnabled = permission === 'granted';
                return permission;
            } catch (error) {
                console.warn('Could not request notification permission:', error);
                return 'denied';
            }
        }
        return 'unsupported';
    }

    /**
     * Check if notifications are supported and permitted
     * @returns {boolean} Whether notifications can be shown
     */
    canShowNotifications() {
        return (
            'Notification' in window &&
            Notification.permission === 'granted' &&
            this.isEnabled
        );
    }

    /**
     * Send a notification for session start
     * @param {string} sessionType - Type of session starting
     */
    notifySessionStart(sessionType) {
        if (!this.canShowNotifications()) return;

        const message = this.sessionMessages[sessionType] || 'Session starting!';
        this.showNotification('Pomodoro Timer', message);
    }

    /**
     * Send a notification for session completion
     * @param {string} sessionType - Type of session that completed
     */
    notifySessionComplete(sessionType) {
        if (!this.canShowNotifications()) return;

        const message = this.completionMessages[sessionType] || 'Session completed!';
        this.showNotification('Pomodoro Timer', message);
    }

    /**
     * Show a browser notification
     * @param {string} title - Notification title
     * @param {string} body - Notification body text
     * @param {object} options - Additional notification options
     */
    showNotification(title, body, options = {}) {
        if (!this.canShowNotifications()) return;

        const defaultOptions = {
            body: body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'pomodoro-timer',
            requireInteraction: false,
            ...options
        };

        try {
            const notification = new Notification(title, defaultOptions);
            
            // Auto-close notification after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

            // Focus window when notification is clicked
            notification.onclick = () => {
                window.focus();
                notification.close();
            };

        } catch (error) {
            console.warn('Could not show notification:', error);
        }
    }

    /**
     * Play a notification sound
     * @param {string} type - Type of sound ('completion', 'start', 'tick')
     */
    playSound(type = 'completion') {
        if (!this.soundEnabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Configure sound based on type
            this.configureSoundType(oscillator, gainNode, type);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);

        } catch (error) {
            console.warn('Could not play notification sound:', error);
        }
    }

    /**
     * Configure oscillator and gain for different sound types
     * @param {OscillatorNode} oscillator - Web Audio oscillator
     * @param {GainNode} gainNode - Web Audio gain node
     * @param {string} type - Sound type
     */
    configureSoundType(oscillator, gainNode, type) {
        switch (type) {
            case 'completion':
                // Higher pitched, longer sound for session completion
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                break;
                
            case 'start':
                // Medium pitched, shorter sound for session start
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                break;
                
            case 'tick':
                // Low pitched, very short sound for timer ticks
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                break;
                
            default:
                // Default completion sound
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        }
    }

    /**
     * Play a custom sequence of sounds
     * @param {Array} sequence - Array of sound configurations
     */
    playSoundSequence(sequence) {
        if (!this.soundEnabled || !this.audioContext) return;

        sequence.forEach((sound, index) => {
            setTimeout(() => {
                this.playCustomSound(sound.frequency, sound.duration, sound.volume);
            }, sound.delay || index * 200);
        });
    }

    /**
     * Play a custom sound with specific parameters
     * @param {number} frequency - Sound frequency in Hz
     * @param {number} duration - Sound duration in seconds
     * @param {number} volume - Sound volume (0-1)
     */
    playCustomSound(frequency, duration, volume = 0.3) {
        if (!this.soundEnabled || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);

        } catch (error) {
            console.warn('Could not play custom sound:', error);
        }
    }

    /**
     * Enable or disable notifications
     * @param {boolean} enabled - Whether to enable notifications
     */
    setNotificationsEnabled(enabled) {
        this.isEnabled = enabled;
    }

    /**
     * Enable or disable sounds
     * @param {boolean} enabled - Whether to enable sounds
     */
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    /**
     * Get current notification settings
     * @returns {object} Current settings
     */
    getSettings() {
        return {
            notificationsEnabled: this.isEnabled,
            soundEnabled: this.soundEnabled,
            permission: 'Notification' in window ? Notification.permission : 'unsupported'
        };
    }

    /**
     * Update notification messages
     * @param {object} messages - New message objects
     */
    updateMessages(messages) {
        if (messages.sessionMessages) {
            this.sessionMessages = { ...this.sessionMessages, ...messages.sessionMessages };
        }
        if (messages.completionMessages) {
            this.completionMessages = { ...this.completionMessages, ...messages.completionMessages };
        }
    }

    /**
     * Test notifications and sounds
     */
    test() {
        console.log('Testing notifications and sounds...');
        
        if (this.canShowNotifications()) {
            this.showNotification('Test Notification', 'This is a test notification from Pomodoro Timer!');
        } else {
            console.log('Notifications not available or not permitted');
        }

        if (this.soundEnabled) {
            this.playSound('completion');
        } else {
            console.log('Sounds are disabled');
        }
    }

    /**
     * Resume audio context if suspended (needed for some browsers)
     */
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (error) {
                console.warn('Could not resume audio context:', error);
            }
        }
    }
}

// Export for module usage or make globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Notifications;
} else {
    window.Notifications = Notifications;
}