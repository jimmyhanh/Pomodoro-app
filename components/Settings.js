/**
 * Settings Component - Handles settings management
 * Manages modal display, form handling, and localStorage persistence
 */
class Settings {
    constructor() {
        this.defaultSettings = {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsUntilLongBreak: 4,
            autoStartBreaks: false,
            autoStartPomodoros: false,
            enableNotifications: true,
            enableSounds: true
        };

        this.settings = { ...this.defaultSettings };
        this.onSettingsChange = null; // callback when settings change

        // DOM elements
        this.settingsModal = document.getElementById('settings-modal');
        this.initializeEventListeners();
        this.loadFromStorage();
    }

    /**
     * Initialize event listeners for settings modal
     */
    initializeEventListeners() {
        const settingsBtn = document.getElementById('settings-btn');
        const cancelBtn = document.getElementById('cancel-settings');
        const saveBtn = document.getElementById('save-settings');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.open());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
        }

        // Close modal when clicking outside
        if (this.settingsModal) {
            this.settingsModal.addEventListener('click', (e) => {
                if (e.target === this.settingsModal) {
                    this.close();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && !this.settingsModal.classList.contains('hidden')) {
                this.close();
            }
        });
    }

    /**
     * Open the settings modal
     */
    open() {
        this.populateForm();
        if (this.settingsModal) {
            this.settingsModal.classList.remove('hidden');
        }
    }

    /**
     * Close the settings modal
     */
    close() {
        if (this.settingsModal) {
            this.settingsModal.classList.add('hidden');
        }
    }

    /**
     * Populate the settings form with current values
     */
    populateForm() {
        const elements = {
            'work-duration': this.settings.workDuration,
            'short-break-duration': this.settings.shortBreakDuration,
            'long-break-duration': this.settings.longBreakDuration,
            'sessions-until-long-break': this.settings.sessionsUntilLongBreak,
            'auto-start-breaks': this.settings.autoStartBreaks,
            'auto-start-pomodoros': this.settings.autoStartPomodoros,
            'enable-notifications': this.settings.enableNotifications,
            'enable-sounds': this.settings.enableSounds
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    }

    /**
     * Save settings from the form
     */
    save() {
        const newSettings = {
            workDuration: this.getNumberValue('work-duration'),
            shortBreakDuration: this.getNumberValue('short-break-duration'),
            longBreakDuration: this.getNumberValue('long-break-duration'),
            sessionsUntilLongBreak: this.getNumberValue('sessions-until-long-break'),
            autoStartBreaks: this.getCheckboxValue('auto-start-breaks'),
            autoStartPomodoros: this.getCheckboxValue('auto-start-pomodoros'),
            enableNotifications: this.getCheckboxValue('enable-notifications'),
            enableSounds: this.getCheckboxValue('enable-sounds')
        };

        // Validate settings
        if (this.validateSettings(newSettings)) {
            this.updateSettings(newSettings);
            this.saveToStorage();
            this.close();

            // Call change callback if provided
            if (this.onSettingsChange) {
                this.onSettingsChange(this.settings);
            }
        }
    }

    /**
     * Get number value from form element
     * @param {string} id - Element ID
     * @returns {number} Parsed number value
     */
    getNumberValue(id) {
        const element = document.getElementById(id);
        return element ? parseInt(element.value) || 0 : 0;
    }

    /**
     * Get checkbox value from form element
     * @param {string} id - Element ID
     * @returns {boolean} Checkbox checked state
     */
    getCheckboxValue(id) {
        const element = document.getElementById(id);
        return element ? element.checked : false;
    }

    /**
     * Validate settings values
     * @param {object} settings - Settings to validate
     * @returns {boolean} Whether settings are valid
     */
    validateSettings(settings) {
        const isValid = (
            settings.workDuration > 0 && settings.workDuration <= 60 &&
            settings.shortBreakDuration > 0 && settings.shortBreakDuration <= 30 &&
            settings.longBreakDuration > 0 && settings.longBreakDuration <= 60 &&
            settings.sessionsUntilLongBreak >= 2 && settings.sessionsUntilLongBreak <= 10
        );

        if (!isValid) {
            alert('Please enter valid settings values within the allowed ranges.');
        }

        return isValid;
    }

    /**
     * Update internal settings
     * @param {object} newSettings - New settings object
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    /**
     * Get current settings
     * @returns {object} Current settings object
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Get a specific setting value
     * @param {string} key - Setting key
     * @returns {*} Setting value
     */
    getSetting(key) {
        return this.settings[key];
    }

    /**
     * Set a specific setting value
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     */
    setSetting(key, value) {
        if (this.settings.hasOwnProperty(key)) {
            this.settings[key] = value;
            this.saveToStorage();
        }
    }

    /**
     * Reset settings to defaults
     */
    resetToDefaults() {
        this.settings = { ...this.defaultSettings };
        this.saveToStorage();
        
        if (this.onSettingsChange) {
            this.onSettingsChange(this.settings);
        }
    }

    /**
     * Save settings to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Could not save settings to localStorage:', error);
        }
    }

    /**
     * Load settings from localStorage
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('pomodoroSettings');
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                // Only update settings that exist in default settings
                Object.keys(this.defaultSettings).forEach(key => {
                    if (parsedSettings.hasOwnProperty(key)) {
                        this.settings[key] = parsedSettings[key];
                    }
                });
            }
        } catch (error) {
            console.warn('Could not load settings from localStorage:', error);
            this.settings = { ...this.defaultSettings };
        }
    }

    /**
     * Export settings as JSON
     * @returns {string} Settings as JSON string
     */
    exportSettings() {
        return JSON.stringify(this.settings, null, 2);
    }

    /**
     * Import settings from JSON
     * @param {string} jsonString - Settings as JSON string
     * @returns {boolean} Whether import was successful
     */
    importSettings(jsonString) {
        try {
            const importedSettings = JSON.parse(jsonString);
            if (this.validateSettings(importedSettings)) {
                this.updateSettings(importedSettings);
                this.saveToStorage();
                
                if (this.onSettingsChange) {
                    this.onSettingsChange(this.settings);
                }
                return true;
            }
        } catch (error) {
            console.warn('Could not import settings:', error);
        }
        return false;
    }
}

// Export for module usage or make globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Settings;
} else {
    window.Settings = Settings;
}