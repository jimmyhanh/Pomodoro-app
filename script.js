class PomodoroTimer {
    constructor() {
        // Timer settings (in minutes)
        this.settings = {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsUntilLongBreak: 4,
            autoStartBreaks: false,
            autoStartPomodoros: false,
            enableNotifications: true,
            enableSounds: true
        };

        // Timer state
        this.currentTime = this.settings.workDuration * 60; // in seconds
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = 'work'; // 'work', 'shortBreak', 'longBreak'
        this.sessionCount = 0;
        this.completedPomodoros = 0;
        this.timer = null;

        // DOM elements
        this.timeDisplay = document.getElementById('time-display');
        this.sessionTitle = document.getElementById('session-title');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.progressBar = document.getElementById('progress-bar');
        this.sessionCounter = document.getElementById('session-counter');
        this.settingsModal = document.getElementById('settings-modal');

        this.initializeEventListeners();
        this.updateDisplay();
        this.requestNotificationPermission();
    }

    initializeEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.skipBtn.addEventListener('click', () => this.skipSession());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        
        // Settings modal events
        document.getElementById('cancel-settings').addEventListener('click', () => this.closeSettings());
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        
        // Close modal when clicking outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });
        
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
            } else if (e.code === 'Escape') {
                this.closeSettings();
            }
        });

        // Prevent spacebar from scrolling
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
            }
        });
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.isRunning = true;
        this.isPaused = false;
        
        this.timer = setInterval(() => {
            this.currentTime--;
            this.updateDisplay();
            
            if (this.currentTime <= 0) {
                this.completeSession();
            }
        }, 1000);

        this.updatePlayPauseButton();
    }

    pauseTimer() {
        this.isRunning = false;
        this.isPaused = true;
        clearInterval(this.timer);
        this.updatePlayPauseButton();
    }

    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timer);
        
        // Reset to current session duration
        this.currentTime = this.getSessionDuration(this.currentSession);
        this.updateDisplay();
        this.updatePlayPauseButton();
    }

    skipSession() {
        this.pauseTimer();
        this.completeSession();
    }

    completeSession() {
        this.pauseTimer();
        
        // Play completion sound
        if (this.settings.enableSounds) {
            this.playNotificationSound();
        }

        // Send notification
        if (this.settings.enableNotifications) {
            this.sendNotification();
        }

        // Update session count and determine next session
        if (this.currentSession === 'work') {
            this.completedPomodoros++;
            this.sessionCount++;
            
            if (this.sessionCount % this.settings.sessionsUntilLongBreak === 0) {
                this.currentSession = 'longBreak';
            } else {
                this.currentSession = 'shortBreak';
            }
        } else {
            this.currentSession = 'work';
        }

        // Set time for next session
        this.currentTime = this.getSessionDuration(this.currentSession);
        this.updateDisplay();

        // Auto-start next session if enabled
        if ((this.currentSession !== 'work' && this.settings.autoStartBreaks) ||
            (this.currentSession === 'work' && this.settings.autoStartPomodoros)) {
            setTimeout(() => this.startTimer(), 1000);
        }
    }

    getSessionDuration(sessionType) {
        switch (sessionType) {
            case 'work':
                return this.settings.workDuration * 60;
            case 'shortBreak':
                return this.settings.shortBreakDuration * 60;
            case 'longBreak':
                return this.settings.longBreakDuration * 60;
            default:
                return this.settings.workDuration * 60;
        }
    }

    updateDisplay() {
        // Update time display
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update session title
        const sessionTitles = {
            work: '🍅 Focus Time!',
            shortBreak: '☕ Short Break',
            longBreak: '🎉 Long Break'
        };
        this.sessionTitle.textContent = sessionTitles[this.currentSession];

        // Update progress bar
        const totalDuration = this.getSessionDuration(this.currentSession);
        const progress = ((totalDuration - this.currentTime) / totalDuration) * 100;
        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }

        // Update session counter
        if (this.sessionCounter) {
            this.sessionCounter.textContent = `Completed: ${this.completedPomodoros}`;
        }

        // Update document title
        const titleMinutes = Math.floor(this.currentTime / 60);
        const titleSeconds = this.currentTime % 60;
        document.title = `${titleMinutes.toString().padStart(2, '0')}:${titleSeconds.toString().padStart(2, '0')} - ${sessionTitles[this.currentSession]}`;

        // Update body class for styling
        document.body.className = document.body.className.replace(/session-\w+/g, '');
        document.body.classList.add(`session-${this.currentSession}`);
    }

    updatePlayPauseButton() {
        const playIcon = `<svg class="fill-current" xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px"><path d="M320-200v-560l440 280-440 280Z"/></svg>`;
        const pauseIcon = `<svg class="fill-current" xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>`;
        
        this.playPauseBtn.innerHTML = this.isRunning ? pauseIcon : playIcon;
        this.playPauseBtn.setAttribute('aria-label', this.isRunning ? 'pause' : 'play');
    }

    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }

    sendNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const sessionMessages = {
                work: '🍅 Time to focus! Work session starting.',
                shortBreak: '☕ Take a short break! You\'ve earned it.',
                longBreak: '🎉 Long break time! Great job on completing a cycle.'
            };

            new Notification('Pomodoro Timer', {
                body: sessionMessages[this.currentSession],
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }
    }

    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

    // Settings management
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        // If we're not running and current session duration changed, update current time
        if (!this.isRunning) {
            this.currentTime = this.getSessionDuration(this.currentSession);
            this.updateDisplay();
        }
        
        // Save to localStorage
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    // Settings UI methods
    openSettings() {
        this.populateSettingsForm();
        this.settingsModal.classList.remove('hidden');
    }

    closeSettings() {
        this.settingsModal.classList.add('hidden');
    }

    populateSettingsForm() {
        document.getElementById('work-duration').value = this.settings.workDuration;
        document.getElementById('short-break-duration').value = this.settings.shortBreakDuration;
        document.getElementById('long-break-duration').value = this.settings.longBreakDuration;
        document.getElementById('sessions-until-long-break').value = this.settings.sessionsUntilLongBreak;
        document.getElementById('auto-start-breaks').checked = this.settings.autoStartBreaks;
        document.getElementById('auto-start-pomodoros').checked = this.settings.autoStartPomodoros;
        document.getElementById('enable-notifications').checked = this.settings.enableNotifications;
        document.getElementById('enable-sounds').checked = this.settings.enableSounds;
    }

    saveSettings() {
        const newSettings = {
            workDuration: parseInt(document.getElementById('work-duration').value),
            shortBreakDuration: parseInt(document.getElementById('short-break-duration').value),
            longBreakDuration: parseInt(document.getElementById('long-break-duration').value),
            sessionsUntilLongBreak: parseInt(document.getElementById('sessions-until-long-break').value),
            autoStartBreaks: document.getElementById('auto-start-breaks').checked,
            autoStartPomodoros: document.getElementById('auto-start-pomodoros').checked,
            enableNotifications: document.getElementById('enable-notifications').checked,
            enableSounds: document.getElementById('enable-sounds').checked
        };

        this.updateSettings(newSettings);
        this.closeSettings();
    }

    // Initialize the app
    init() {
        this.loadSettings();
        this.currentTime = this.getSessionDuration(this.currentSession);
        this.updateDisplay();
        this.updatePlayPauseButton();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroTimer = new PomodoroTimer();
    window.pomodoroTimer.init();
});