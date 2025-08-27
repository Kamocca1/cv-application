/**
 * Storage Manager - Enhanced data persistence with error handling and recovery
 *
 * Provides robust localStorage management with:
 * - Error handling and graceful degradation
 * - Data validation and recovery
 * - Backup and restore mechanisms
 * - Cross-session persistence
 */

import { DEFAULT_CV_DATA, SECTIONS } from "../models/dataTypes.js";
import { deepClone } from "./dataHelpers.js";

// Storage configuration
const STORAGE_CONFIG = {
    PRIMARY_KEY: "cv-builder-data",
    BACKUP_KEY: "cv-builder-backup",
    METADATA_KEY: "cv-builder-metadata",
    VERSION: "1.0.0",
    MAX_BACKUP_COUNT: 5,
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    COMPRESSION_THRESHOLD: 50000, // 50KB
};

// Storage events
const STORAGE_EVENTS = {
    SAVE_SUCCESS: "storage:save:success",
    SAVE_ERROR: "storage:save:error",
    LOAD_SUCCESS: "storage:load:success",
    LOAD_ERROR: "storage:load:error",
    RECOVERY_SUCCESS: "storage:recovery:success",
    RECOVERY_ERROR: "storage:recovery:error",
};

/**
 * Storage Manager Class
 * Handles all data persistence operations with error handling and recovery
 */
class StorageManager {
    constructor() {
        this.isAvailable = this.checkStorageAvailability();
        this.eventListeners = new Map();
        this.autoSaveTimer = null;
        this.lastSaveTime = null;
        this.saveQueue = [];
        this.isProcessingQueue = false;

        // Initialize storage metadata
        this.initializeMetadata();

        // Set up beforeunload handler for emergency saves
        this.setupEmergencyHandlers();
    }

    /**
     * Check if localStorage is available and functional
     */
    checkStorageAvailability() {
        try {
            const testKey = "__storage_test__";
            localStorage.setItem(testKey, "test");
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn("localStorage is not available:", error.message);
            return false;
        }
    }

    /**
     * Initialize storage metadata
     */
    initializeMetadata() {
        if (!this.isAvailable) return;

        try {
            const metadata = this.getMetadata();
            if (!metadata) {
                this.setMetadata({
                    version: STORAGE_CONFIG.VERSION,
                    created: new Date().toISOString(),
                    lastAccess: new Date().toISOString(),
                    saveCount: 0,
                    backupCount: 0,
                });
            } else {
                // Update last access time
                this.setMetadata({
                    ...metadata,
                    lastAccess: new Date().toISOString(),
                });
            }
        } catch (error) {
            console.error("Failed to initialize storage metadata:", error);
        }
    }

    /**
     * Set up emergency save handlers
     */
    setupEmergencyHandlers() {
        // Save data before page unload
        window.addEventListener("beforeunload", (event) => {
            if (this.saveQueue.length > 0) {
                // Process any pending saves synchronously
                this.processSaveQueueSync();
            }
        });

        // Handle visibility change (tab switching, minimizing)
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && this.saveQueue.length > 0) {
                this.processSaveQueueSync();
            }
        });

        // Handle online/offline events
        window.addEventListener("online", () => {
            this.emit(STORAGE_EVENTS.RECOVERY_SUCCESS, {
                message: "Connection restored",
                timestamp: new Date().toISOString(),
            });
        });

        window.addEventListener("offline", () => {
            // Ensure data is saved locally when going offline
            if (this.saveQueue.length > 0) {
                this.processSaveQueueSync();
            }
        });
    }

    /**
     * Get storage metadata
     */
    getMetadata() {
        if (!this.isAvailable) return null;

        try {
            const metadata = localStorage.getItem(STORAGE_CONFIG.METADATA_KEY);
            return metadata ? JSON.parse(metadata) : null;
        } catch (error) {
            console.error("Failed to get storage metadata:", error);
            return null;
        }
    }

    /**
     * Set storage metadata
     */
    setMetadata(metadata) {
        if (!this.isAvailable) return false;

        try {
            localStorage.setItem(
                STORAGE_CONFIG.METADATA_KEY,
                JSON.stringify(metadata)
            );
            return true;
        } catch (error) {
            console.error("Failed to set storage metadata:", error);
            return false;
        }
    }

    /**
     * Validate CV data structure
     */
    validateData(data) {
        if (!data || typeof data !== "object") {
            return { isValid: false, error: "Data is not an object" };
        }

        // Check required sections
        const requiredSections = [
            SECTIONS.PERSONAL_INFO,
            SECTIONS.EDUCATION,
            SECTIONS.WORK_EXPERIENCE,
        ];
        for (const section of requiredSections) {
            if (!(section in data)) {
                return { isValid: false, error: `Missing section: ${section}` };
            }
        }

        // Validate personal info structure
        const personalInfo = data[SECTIONS.PERSONAL_INFO];
        if (!personalInfo || typeof personalInfo !== "object") {
            return { isValid: false, error: "Invalid personal info structure" };
        }

        // Validate arrays
        if (!Array.isArray(data[SECTIONS.EDUCATION])) {
            return { isValid: false, error: "Education must be an array" };
        }

        if (!Array.isArray(data[SECTIONS.WORK_EXPERIENCE])) {
            return {
                isValid: false,
                error: "Work experience must be an array",
            };
        }

        return { isValid: true };
    }

    /**
     * Sanitize and merge data with defaults
     */
    sanitizeData(data) {
        const sanitized = {
            ...DEFAULT_CV_DATA,
            ...data,
        };

        // Ensure personal info has all required fields
        sanitized[SECTIONS.PERSONAL_INFO] = {
            ...DEFAULT_CV_DATA[SECTIONS.PERSONAL_INFO],
            ...(data[SECTIONS.PERSONAL_INFO] || {}),
        };

        // Ensure arrays are valid
        sanitized[SECTIONS.EDUCATION] = Array.isArray(data[SECTIONS.EDUCATION])
            ? data[SECTIONS.EDUCATION]
            : [];

        sanitized[SECTIONS.WORK_EXPERIENCE] = Array.isArray(
            data[SECTIONS.WORK_EXPERIENCE]
        )
            ? data[SECTIONS.WORK_EXPERIENCE]
            : [];

        return sanitized;
    }

    /**
     * Save data to localStorage with error handling
     */
    async saveData(data, options = {}) {
        const {
            createBackup = true,
            skipValidation = false,
            priority = "normal",
        } = options;

        if (!this.isAvailable) {
            const error = new Error("Storage is not available");
            this.emit(STORAGE_EVENTS.SAVE_ERROR, { error: error.message });
            throw error;
        }

        // Validate data unless skipped
        if (!skipValidation) {
            const validation = this.validateData(data);
            if (!validation.isValid) {
                const error = new Error(
                    `Data validation failed: ${validation.error}`
                );
                this.emit(STORAGE_EVENTS.SAVE_ERROR, { error: error.message });
                throw error;
            }
        }

        // Add to save queue
        const saveOperation = {
            data: deepClone(data),
            timestamp: new Date().toISOString(),
            createBackup,
            priority,
            id: Date.now() + Math.random(),
        };

        if (priority === "high") {
            this.saveQueue.unshift(saveOperation);
        } else {
            this.saveQueue.push(saveOperation);
        }

        // Process queue and return result
        try {
            const result = await this.processSaveQueue();
            return result;
        } catch (error) {
            this.emit(STORAGE_EVENTS.SAVE_ERROR, { error: error.message });
            throw error;
        }
    }

    /**
     * Process save queue asynchronously
     */
    async processSaveQueue() {
        if (this.isProcessingQueue || this.saveQueue.length === 0) {
            return true;
        }

        this.isProcessingQueue = true;
        let allSuccessful = true;

        try {
            while (this.saveQueue.length > 0) {
                const operation = this.saveQueue.shift();
                const success = await this.performSave(operation);
                if (!success) {
                    allSuccessful = false;
                }
            }
        } catch (error) {
            console.error("Error processing save queue:", error);
            allSuccessful = false;
        } finally {
            this.isProcessingQueue = false;
        }

        return allSuccessful;
    }

    /**
     * Process save queue synchronously (for emergency saves)
     */
    processSaveQueueSync() {
        if (this.saveQueue.length === 0) return;

        try {
            while (this.saveQueue.length > 0) {
                const operation = this.saveQueue.shift();
                this.performSaveSync(operation);
            }
        } catch (error) {
            console.error("Error in synchronous save:", error);
        }
    }

    /**
     * Perform actual save operation
     */
    async performSave(operation) {
        try {
            // Create backup if requested
            if (operation.createBackup) {
                await this.createBackup();
            }

            // Save main data
            const dataString = JSON.stringify(operation.data);
            localStorage.setItem(STORAGE_CONFIG.PRIMARY_KEY, dataString);

            // Update metadata
            const metadata = this.getMetadata() || {};
            this.setMetadata({
                ...metadata,
                lastSave: operation.timestamp,
                saveCount: (metadata.saveCount || 0) + 1,
            });

            this.lastSaveTime = new Date(operation.timestamp);

            this.emit(STORAGE_EVENTS.SAVE_SUCCESS, {
                timestamp: operation.timestamp,
                size: dataString.length,
            });

            return true;
        } catch (error) {
            console.error("Save operation failed:", error);
            this.emit(STORAGE_EVENTS.SAVE_ERROR, { error: error.message });
            throw error;
        }
    }

    /**
     * Perform synchronous save operation
     */
    performSaveSync(operation) {
        try {
            const dataString = JSON.stringify(operation.data);
            localStorage.setItem(STORAGE_CONFIG.PRIMARY_KEY, dataString);
            this.lastSaveTime = new Date(operation.timestamp);
            return true;
        } catch (error) {
            console.error("Synchronous save failed:", error);
            return false;
        }
    }

    /**
     * Load data from localStorage with recovery mechanisms
     */
    async loadData() {
        if (!this.isAvailable) {
            const error = new Error("Storage is not available");
            this.emit(STORAGE_EVENTS.LOAD_ERROR, { error: error.message });
            return { data: DEFAULT_CV_DATA, recovered: false };
        }

        try {
            // Try to load primary data
            const primaryData = await this.loadPrimaryData();
            if (primaryData) {
                this.emit(STORAGE_EVENTS.LOAD_SUCCESS, {
                    source: "primary",
                    timestamp: new Date().toISOString(),
                });
                return { data: primaryData, recovered: false };
            }

            // Try to recover from backup
            const backupData = await this.recoverFromBackup();
            if (backupData) {
                this.emit(STORAGE_EVENTS.RECOVERY_SUCCESS, {
                    source: "backup",
                    timestamp: new Date().toISOString(),
                });
                return { data: backupData, recovered: true };
            }

            // Return default data if nothing can be recovered
            this.emit(STORAGE_EVENTS.LOAD_SUCCESS, {
                source: "default",
                timestamp: new Date().toISOString(),
            });
            return { data: DEFAULT_CV_DATA, recovered: false };
        } catch (error) {
            console.error("Load operation failed:", error);
            this.emit(STORAGE_EVENTS.LOAD_ERROR, { error: error.message });
            return { data: DEFAULT_CV_DATA, recovered: false };
        }
    }

    /**
     * Load primary data from localStorage
     */
    async loadPrimaryData() {
        try {
            const dataString = localStorage.getItem(STORAGE_CONFIG.PRIMARY_KEY);
            if (!dataString) return null;

            const data = JSON.parse(dataString);
            const validation = this.validateData(data);

            if (validation.isValid) {
                return this.sanitizeData(data);
            } else {
                console.warn(
                    "Primary data validation failed:",
                    validation.error
                );
                return null;
            }
        } catch (error) {
            console.error("Failed to load primary data:", error);
            return null;
        }
    }

    /**
     * Create backup of current data
     */
    async createBackup() {
        try {
            const currentData = localStorage.getItem(
                STORAGE_CONFIG.PRIMARY_KEY
            );
            if (!currentData) return false;

            const backups = this.getBackups();
            const newBackup = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                data: currentData,
                size: currentData.length,
            };

            backups.unshift(newBackup);

            // Keep only the most recent backups
            if (backups.length > STORAGE_CONFIG.MAX_BACKUP_COUNT) {
                backups.splice(STORAGE_CONFIG.MAX_BACKUP_COUNT);
            }

            localStorage.setItem(
                STORAGE_CONFIG.BACKUP_KEY,
                JSON.stringify(backups)
            );

            // Update metadata
            const metadata = this.getMetadata() || {};
            this.setMetadata({
                ...metadata,
                lastBackup: newBackup.timestamp,
                backupCount: backups.length,
            });

            return true;
        } catch (error) {
            console.error("Failed to create backup:", error);
            return false;
        }
    }

    /**
     * Get all backups
     */
    getBackups() {
        try {
            const backupsString = localStorage.getItem(
                STORAGE_CONFIG.BACKUP_KEY
            );
            return backupsString ? JSON.parse(backupsString) : [];
        } catch (error) {
            console.error("Failed to get backups:", error);
            return [];
        }
    }

    /**
     * Recover data from backup
     */
    async recoverFromBackup() {
        try {
            const backups = this.getBackups();
            if (backups.length === 0) return null;

            // Try each backup starting with the most recent
            for (const backup of backups) {
                try {
                    const data = JSON.parse(backup.data);
                    const validation = this.validateData(data);

                    if (validation.isValid) {
                        console.log(
                            `Recovered data from backup: ${backup.timestamp}`
                        );
                        return this.sanitizeData(data);
                    }
                } catch (error) {
                    console.warn(`Backup ${backup.id} is corrupted:`, error);
                    continue;
                }
            }

            return null;
        } catch (error) {
            console.error("Failed to recover from backup:", error);
            return null;
        }
    }

    /**
     * Clear all stored data
     */
    async clearAllData() {
        try {
            localStorage.removeItem(STORAGE_CONFIG.PRIMARY_KEY);
            localStorage.removeItem(STORAGE_CONFIG.BACKUP_KEY);
            localStorage.removeItem(STORAGE_CONFIG.METADATA_KEY);

            this.lastSaveTime = null;
            this.saveQueue = [];

            return true;
        } catch (error) {
            console.error("Failed to clear data:", error);
            return false;
        }
    }

    /**
     * Get storage statistics
     */
    getStorageStats() {
        const metadata = this.getMetadata();
        const backups = this.getBackups();

        let totalSize = 0;
        try {
            const primaryData = localStorage.getItem(
                STORAGE_CONFIG.PRIMARY_KEY
            );
            const backupData = localStorage.getItem(STORAGE_CONFIG.BACKUP_KEY);
            const metadataData = localStorage.getItem(
                STORAGE_CONFIG.METADATA_KEY
            );

            totalSize =
                (primaryData?.length || 0) +
                (backupData?.length || 0) +
                (metadataData?.length || 0);
        } catch (error) {
            console.error("Failed to calculate storage size:", error);
        }

        return {
            isAvailable: this.isAvailable,
            totalSize,
            saveCount: metadata?.saveCount || 0,
            backupCount: backups.length,
            lastSave: metadata?.lastSave,
            lastBackup: metadata?.lastBackup,
            created: metadata?.created,
            version: metadata?.version,
        };
    }

    /**
     * Event system for storage operations
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(
                        `Error in event listener for ${event}:`,
                        error
                    );
                }
            });
        }
    }

    /**
     * Start auto-save functionality
     */
    startAutoSave(callback, interval = STORAGE_CONFIG.AUTO_SAVE_INTERVAL) {
        this.stopAutoSave();

        this.autoSaveTimer = setInterval(() => {
            if (typeof callback === "function") {
                try {
                    callback();
                } catch (error) {
                    console.error("Auto-save callback error:", error);
                }
            }
        }, interval);
    }

    /**
     * Stop auto-save functionality
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * Get last save time
     */
    getLastSaveTime() {
        return this.lastSaveTime;
    }

    /**
     * Check if there are pending saves
     */
    hasPendingSaves() {
        return this.saveQueue.length > 0;
    }
}

// Export singleton instance
export const storageManager = new StorageManager();

// Export events for external use
export { STORAGE_EVENTS };

// Export default
export default storageManager;
