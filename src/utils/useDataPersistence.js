/**
 * useDataPersistence Hook
 *
 * React hook for managing data persistence with enhanced error handling,
 * auto-save functionality, and recovery mechanisms.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { storageManager, STORAGE_EVENTS } from "./storageManager.js";
import { DEFAULT_CV_DATA } from "../models/dataTypes.js";
import { deepClone, isEqual } from "./dataHelpers.js";

/**
 * Custom hook for data persistence
 * @param {Object} options - Configuration options
 * @returns {Object} Persistence state and methods
 */
export const useDataPersistence = (options = {}) => {
    const {
        autoSave = true,
        autoSaveDelay = 2000,
        enableBackups = true,
        onSaveSuccess,
        onSaveError,
        onLoadSuccess,
        onLoadError,
        onRecovery,
    } = options;

    // State management
    const [data, setData] = useState(DEFAULT_CV_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    const [isRecovered, setIsRecovered] = useState(false);
    const [storageStats, setStorageStats] = useState(null);

    // Refs for managing timers and preventing stale closures
    const autoSaveTimerRef = useRef(null);
    const lastDataRef = useRef(DEFAULT_CV_DATA);
    const saveInProgressRef = useRef(false);

    /**
     * Load data from storage on mount
     */
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setSaveError(null);

                const result = await storageManager.loadData();

                setData(result.data);
                lastDataRef.current = result.data;
                setIsRecovered(result.recovered);

                if (result.recovered && onRecovery) {
                    onRecovery(result.data);
                }

                if (onLoadSuccess) {
                    onLoadSuccess(result.data, result.recovered);
                }

                // Update storage stats
                setStorageStats(storageManager.getStorageStats());
            } catch (error) {
                console.error("Failed to load data:", error);
                setSaveError(
                    "Failed to load saved data. Starting with empty CV."
                );

                if (onLoadError) {
                    onLoadError(error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [onLoadSuccess, onLoadError, onRecovery]);

    /**
     * Set up storage event listeners
     */
    useEffect(() => {
        const handleSaveSuccess = (eventData) => {
            setIsSaving(false);
            setSaveError(null);
            setLastSaved(new Date(eventData.timestamp));

            if (onSaveSuccess) {
                onSaveSuccess(eventData);
            }
        };

        const handleSaveError = (eventData) => {
            setIsSaving(false);
            setSaveError(eventData.error);

            if (onSaveError) {
                onSaveError(new Error(eventData.error));
            }
        };

        const handleRecoverySuccess = (eventData) => {
            console.log("Data recovery successful:", eventData);
        };

        // Subscribe to storage events
        storageManager.on(STORAGE_EVENTS.SAVE_SUCCESS, handleSaveSuccess);
        storageManager.on(STORAGE_EVENTS.SAVE_ERROR, handleSaveError);
        storageManager.on(
            STORAGE_EVENTS.RECOVERY_SUCCESS,
            handleRecoverySuccess
        );

        // Cleanup listeners
        return () => {
            storageManager.off(STORAGE_EVENTS.SAVE_SUCCESS, handleSaveSuccess);
            storageManager.off(STORAGE_EVENTS.SAVE_ERROR, handleSaveError);
            storageManager.off(
                STORAGE_EVENTS.RECOVERY_SUCCESS,
                handleRecoverySuccess
            );
        };
    }, [onSaveSuccess, onSaveError]);

    /**
     * Auto-save functionality
     */
    useEffect(() => {
        if (!autoSave || isLoading) return;

        // Clear existing timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // Check if data has changed
        if (isEqual(data, lastDataRef.current)) {
            return; // No changes to save
        }

        // Set new auto-save timer
        autoSaveTimerRef.current = setTimeout(async () => {
            if (
                !saveInProgressRef.current &&
                !isEqual(data, lastDataRef.current)
            ) {
                await saveData(data, {
                    priority: "normal",
                    source: "auto-save",
                });
            }
        }, autoSaveDelay);

        // Cleanup timer
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [data, autoSave, autoSaveDelay, isLoading]);

    /**
     * Save data to storage
     */
    const saveData = useCallback(
        async (dataToSave = data, options = {}) => {
            if (saveInProgressRef.current) {
                console.log("Save already in progress, skipping...");
                return false;
            }

            try {
                saveInProgressRef.current = true;
                setIsSaving(true);
                setSaveError(null);

                const saveOptions = {
                    createBackup: enableBackups,
                    ...options,
                };

                await storageManager.saveData(dataToSave, saveOptions);

                // Update refs to track saved data
                lastDataRef.current = deepClone(dataToSave);

                // Update storage stats
                setStorageStats(storageManager.getStorageStats());

                return true;
            } catch (error) {
                console.error("Save failed:", error);
                return false;
            } finally {
                saveInProgressRef.current = false;
            }
        },
        [data, enableBackups]
    );

    /**
     * Manual save function
     */
    const manualSave = useCallback(async () => {
        return await saveData(data, { priority: "high", source: "manual" });
    }, [data, saveData]);

    /**
     * Update data with automatic change tracking
     */
    const updateData = useCallback((newData) => {
        setData(newData);
    }, []);

    /**
     * Clear all data
     */
    const clearData = useCallback(async () => {
        try {
            await storageManager.clearAllData();
            setData(DEFAULT_CV_DATA);
            lastDataRef.current = DEFAULT_CV_DATA;
            setLastSaved(null);
            setSaveError(null);
            setIsRecovered(false);
            setStorageStats(storageManager.getStorageStats());
            return true;
        } catch (error) {
            console.error("Failed to clear data:", error);
            setSaveError("Failed to clear data");
            return false;
        }
    }, []);

    /**
     * Export data as JSON
     */
    const exportData = useCallback(() => {
        try {
            const dataString = JSON.stringify(data, null, 2);
            const blob = new Blob([dataString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `cv-data-${
                new Date().toISOString().split("T")[0]
            }.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error("Export failed:", error);
            setSaveError("Failed to export data");
            return false;
        }
    }, [data]);

    /**
     * Import data from JSON file
     */
    const importData = useCallback(
        (file) => {
            return new Promise((resolve, reject) => {
                if (!file) {
                    reject(new Error("No file provided"));
                    return;
                }

                const reader = new FileReader();

                reader.onload = async (event) => {
                    try {
                        const importedData = JSON.parse(event.target.result);

                        // Validate imported data
                        const validation = storageManager.validateData
                            ? storageManager.validateData(importedData)
                            : { isValid: true };

                        if (!validation.isValid) {
                            throw new Error(
                                `Invalid data format: ${validation.error}`
                            );
                        }

                        // Sanitize and set data
                        const sanitizedData = storageManager.sanitizeData
                            ? storageManager.sanitizeData(importedData)
                            : importedData;

                        setData(sanitizedData);

                        // Save imported data
                        await saveData(sanitizedData, {
                            priority: "high",
                            source: "import",
                            createBackup: true,
                        });

                        setSaveError(null);
                        resolve(sanitizedData);
                    } catch (error) {
                        console.error("Import failed:", error);
                        setSaveError(
                            "Failed to import data. Please check the file format."
                        );
                        reject(error);
                    }
                };

                reader.onerror = () => {
                    const error = new Error("Failed to read file");
                    setSaveError(error.message);
                    reject(error);
                };

                reader.readAsText(file);
            });
        },
        [saveData]
    );

    /**
     * Get backup list
     */
    const getBackups = useCallback(() => {
        return storageManager.getBackups();
    }, []);

    /**
     * Restore from backup
     */
    const restoreFromBackup = useCallback(
        async (backupId) => {
            try {
                const backups = storageManager.getBackups();
                const backup = backups.find((b) => b.id === backupId);

                if (!backup) {
                    throw new Error("Backup not found");
                }

                const backupData = JSON.parse(backup.data);
                setData(backupData);

                await saveData(backupData, {
                    priority: "high",
                    source: "restore",
                    createBackup: false, // Don't create backup when restoring
                });

                return true;
            } catch (error) {
                console.error("Restore failed:", error);
                setSaveError("Failed to restore from backup");
                return false;
            }
        },
        [saveData]
    );

    /**
     * Check if there are unsaved changes
     */
    const hasUnsavedChanges = useCallback(() => {
        return !isEqual(data, lastDataRef.current);
    }, [data]);

    /**
     * Force save any pending changes
     */
    const forceSave = useCallback(async () => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        if (hasUnsavedChanges()) {
            return await saveData(data, { priority: "high", source: "force" });
        }

        return true;
    }, [data, hasUnsavedChanges, saveData]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, []);

    return {
        // Data state
        data,
        updateData,

        // Loading and saving states
        isLoading,
        isSaving,
        saveError,
        lastSaved,
        isRecovered,

        // Save operations
        saveData: manualSave,
        forceSave,
        hasUnsavedChanges,

        // Data management
        clearData,
        exportData,
        importData,

        // Backup operations
        getBackups,
        restoreFromBackup,

        // Storage information
        storageStats,

        // Utility methods
        setSaveError, // For clearing errors manually
    };
};

export default useDataPersistence;
