import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import PersonalInfo from "./PersonalInfo.jsx";
import Education from "./Education.jsx";
import WorkExperience from "./WorkExperience.jsx";
import { DEFAULT_CV_DATA, SECTIONS } from "../models/dataTypes.js";
import { deepClone } from "../utils/dataHelpers.js";
import styles from "../styles/CVBuilder.module.css";

/**
 * CVBuilder Container Component
 * Manages overall CV state, data persistence, and coordinates between sections
 */
const CVBuilder = ({
    className = "",
    onDataChange,
    autoSave = true,
    autoSaveDelay = 2000,
}) => {
    // Main CV data state
    const [cvData, setCvData] = useState(DEFAULT_CV_DATA);

    // Loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const [saveError, setSaveError] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);

    // Auto-save timeout reference
    const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

    // localStorage key for data persistence
    const STORAGE_KEY = "cv-builder-data";

    /**
     * Load CV data from localStorage
     */
    const loadFromStorage = useCallback(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);

                // Validate the structure and merge with defaults
                const validatedData = {
                    ...DEFAULT_CV_DATA,
                    ...parsedData,
                    // Ensure arrays exist
                    [SECTIONS.EDUCATION]: Array.isArray(
                        parsedData[SECTIONS.EDUCATION]
                    )
                        ? parsedData[SECTIONS.EDUCATION]
                        : [],
                    [SECTIONS.WORK_EXPERIENCE]: Array.isArray(
                        parsedData[SECTIONS.WORK_EXPERIENCE]
                    )
                        ? parsedData[SECTIONS.WORK_EXPERIENCE]
                        : [],
                    // Ensure personal info object exists
                    [SECTIONS.PERSONAL_INFO]: {
                        ...DEFAULT_CV_DATA[SECTIONS.PERSONAL_INFO],
                        ...(parsedData[SECTIONS.PERSONAL_INFO] || {}),
                    },
                };

                setCvData(validatedData);
                setLastSaved(new Date());
                return true;
            }
        } catch (error) {
            console.error("Error loading CV data from localStorage:", error);
            setSaveError("Failed to load saved data. Starting with empty CV.");
        }
        return false;
    }, []);

    /**
     * Save CV data to localStorage
     */
    const saveToStorage = useCallback(
        async (dataToSave = cvData) => {
            try {
                setSaveError(null);
                const dataString = JSON.stringify(dataToSave);
                localStorage.setItem(STORAGE_KEY, dataString);
                setLastSaved(new Date());

                // Notify parent component of data change
                if (onDataChange) {
                    onDataChange(dataToSave);
                }

                return true;
            } catch (error) {
                console.error("Error saving CV data to localStorage:", error);
                setSaveError("Failed to save data. Your changes may be lost.");
                return false;
            }
        },
        [cvData, onDataChange]
    );

    /**
     * Initialize component - load data from storage
     */
    useEffect(() => {
        const dataLoaded = loadFromStorage();
        if (!dataLoaded) {
            // If no data was loaded, save the default data
            saveToStorage(DEFAULT_CV_DATA);
        }
        setIsLoading(false);
    }, [loadFromStorage, saveToStorage]);

    /**
     * Auto-save functionality
     */
    useEffect(() => {
        if (!autoSave || isLoading) return;

        // Clear existing timeout
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }

        // Set new timeout for auto-save
        const timeout = setTimeout(() => {
            saveToStorage();
        }, autoSaveDelay);

        setAutoSaveTimeout(timeout);

        // Cleanup timeout on unmount or dependency change
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [cvData, autoSave, autoSaveDelay, isLoading, saveToStorage]);

    /**
     * Handle personal info updates
     */
    const handlePersonalInfoUpdate = useCallback((personalInfoData) => {
        setCvData((prevData) => ({
            ...prevData,
            [SECTIONS.PERSONAL_INFO]: personalInfoData,
        }));
    }, []);

    /**
     * Handle education updates
     */
    const handleEducationUpdate = useCallback((educationData) => {
        setCvData((prevData) => ({
            ...prevData,
            [SECTIONS.EDUCATION]: educationData,
        }));
    }, []);

    /**
     * Handle work experience updates
     */
    const handleWorkExperienceUpdate = useCallback((workExperienceData) => {
        setCvData((prevData) => ({
            ...prevData,
            [SECTIONS.WORK_EXPERIENCE]: workExperienceData,
        }));
    }, []);

    /**
     * Manual save function
     */
    const handleManualSave = useCallback(async () => {
        const success = await saveToStorage();
        return success;
    }, [saveToStorage]);

    /**
     * Clear all data
     */
    const handleClearData = useCallback(() => {
        if (
            window.confirm(
                "Are you sure you want to clear all CV data? This action cannot be undone."
            )
        ) {
            setCvData(deepClone(DEFAULT_CV_DATA));
            localStorage.removeItem(STORAGE_KEY);
            setLastSaved(null);
            setSaveError(null);
        }
    }, []);

    /**
     * Export CV data
     */
    const handleExportData = useCallback(() => {
        try {
            const dataString = JSON.stringify(cvData, null, 2);
            const blob = new Blob([dataString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "cv-data.json";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting CV data:", error);
            setSaveError("Failed to export CV data.");
        }
    }, [cvData]);

    /**
     * Import CV data
     */
    const handleImportData = useCallback(
        (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    // Validate and merge with defaults
                    const validatedData = {
                        ...DEFAULT_CV_DATA,
                        ...importedData,
                        [SECTIONS.EDUCATION]: Array.isArray(
                            importedData[SECTIONS.EDUCATION]
                        )
                            ? importedData[SECTIONS.EDUCATION]
                            : [],
                        [SECTIONS.WORK_EXPERIENCE]: Array.isArray(
                            importedData[SECTIONS.WORK_EXPERIENCE]
                        )
                            ? importedData[SECTIONS.WORK_EXPERIENCE]
                            : [],
                        [SECTIONS.PERSONAL_INFO]: {
                            ...DEFAULT_CV_DATA[SECTIONS.PERSONAL_INFO],
                            ...(importedData[SECTIONS.PERSONAL_INFO] || {}),
                        },
                    };

                    setCvData(validatedData);
                    saveToStorage(validatedData);
                    setSaveError(null);
                } catch (error) {
                    console.error("Error importing CV data:", error);
                    setSaveError(
                        "Failed to import CV data. Please check the file format."
                    );
                }
            };

            reader.readAsText(file);
            // Reset the input
            event.target.value = "";
        },
        [saveToStorage]
    );

    /**
     * Check if CV has any data
     */
    const hasData = useMemo(() => {
        const personalInfo = cvData[SECTIONS.PERSONAL_INFO];
        const hasPersonalInfo =
            personalInfo.name || personalInfo.email || personalInfo.phone;
        const hasEducation = cvData[SECTIONS.EDUCATION].length > 0;
        const hasWorkExperience = cvData[SECTIONS.WORK_EXPERIENCE].length > 0;

        return hasPersonalInfo || hasEducation || hasWorkExperience;
    }, [cvData]);

    /**
     * Format last saved time
     */
    const formatLastSaved = useCallback((date) => {
        if (!date) return "Never";

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60)
            return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24)
            return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

        return date.toLocaleDateString();
    }, []);

    // Show loading state
    if (isLoading) {
        return (
            <div className={`${styles.cvBuilder} ${className}`}>
                <div className={styles.loadingState}>
                    <div className={styles.loadingSpinner} />
                    <p>Loading your CV...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.cvBuilder} ${className}`}>
            {/* Header with controls */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>CV Builder</h1>

                    <div className={styles.headerInfo}>
                        <div className={styles.saveStatus}>
                            <span className={styles.saveStatusLabel}>
                                Last saved:
                            </span>
                            <span className={styles.saveStatusTime}>
                                {formatLastSaved(lastSaved)}
                            </span>
                        </div>

                        <div className={styles.headerActions}>
                            <button
                                type="button"
                                onClick={handleManualSave}
                                className={styles.saveButton}
                                title="Save now"
                            >
                                💾 Save
                            </button>

                            <button
                                type="button"
                                onClick={handleExportData}
                                disabled={!hasData}
                                className={styles.exportButton}
                                title="Export CV data"
                            >
                                📤 Export
                            </button>

                            <label
                                className={styles.importButton}
                                title="Import CV data"
                            >
                                📥 Import
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImportData}
                                    className={styles.importInput}
                                />
                            </label>

                            <button
                                type="button"
                                onClick={handleClearData}
                                disabled={!hasData}
                                className={styles.clearButton}
                                title="Clear all data"
                            >
                                🗑️ Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error message */}
                {saveError && (
                    <div className={styles.errorMessage} role="alert">
                        <span className={styles.errorIcon}>⚠️</span>
                        {saveError}
                        <button
                            type="button"
                            onClick={() => setSaveError(null)}
                            className={styles.errorDismiss}
                            aria-label="Dismiss error"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            {/* Main content */}
            <div className={styles.content}>
                <div className={styles.sectionsContainer}>
                    {/* Personal Information Section */}
                    <PersonalInfo
                        data={cvData[SECTIONS.PERSONAL_INFO]}
                        onUpdate={handlePersonalInfoUpdate}
                        className={styles.section}
                    />

                    {/* Education Section */}
                    <Education
                        data={cvData[SECTIONS.EDUCATION]}
                        onUpdate={handleEducationUpdate}
                        className={styles.section}
                    />

                    {/* Work Experience Section */}
                    <WorkExperience
                        data={cvData[SECTIONS.WORK_EXPERIENCE]}
                        onUpdate={handleWorkExperienceUpdate}
                        className={styles.section}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <div className={styles.footerContent}>
                    <p className={styles.footerText}>
                        {hasData
                            ? `Your CV contains ${
                                  Object.values(cvData).flat().length
                              } items`
                            : "Start building your CV by adding your personal information"}
                    </p>

                    {autoSave && (
                        <p className={styles.autoSaveInfo}>
                            <span className={styles.autoSaveIcon}>🔄</span>
                            Auto-save enabled
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

CVBuilder.propTypes = {
    /** Additional CSS class names */
    className: PropTypes.string,
    /** Callback function called when CV data changes */
    onDataChange: PropTypes.func,
    /** Whether to enable auto-save functionality */
    autoSave: PropTypes.bool,
    /** Delay in milliseconds for auto-save */
    autoSaveDelay: PropTypes.number,
};

export default CVBuilder;
