import React, { useState, useCallback, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import PersonalInfo from "./PersonalInfo.jsx";
import Education from "./Education.jsx";
import WorkExperience from "./WorkExperience.jsx";
import CVPreview from "./CVPreview.jsx";
import { DEFAULT_CV_DATA, SECTIONS } from "../models/dataTypes.js";
import { exportToPDF, exportToWord } from "../utils/exportUtils.js";
import styles from "../styles/CVBuilder.module.css";

/**
 * CVBuilder Container Component
 * Simple CV builder that manages state in memory with export functionality
 */
const CVBuilder = ({ className = "", onDataChange }) => {
    // Simple in-memory state management
    const [cvData, setCvData] = useState(DEFAULT_CV_DATA);

    // Ref to access the CV preview element for PDF export
    const previewRef = useRef(null);

    /**
     * Handle personal info updates
     */
    const handlePersonalInfoUpdate = useCallback(
        (personalInfoData) => {
            setCvData((prevData) => {
                const newData = {
                    ...prevData,
                    [SECTIONS.PERSONAL_INFO]: personalInfoData,
                };
                if (onDataChange) {
                    onDataChange(newData);
                }
                return newData;
            });
        },
        [onDataChange]
    );

    /**
     * Handle education updates
     */
    const handleEducationUpdate = useCallback(
        (educationData) => {
            setCvData((prevData) => {
                const newData = {
                    ...prevData,
                    [SECTIONS.EDUCATION]: educationData,
                };
                if (onDataChange) {
                    onDataChange(newData);
                }
                return newData;
            });
        },
        [onDataChange]
    );

    /**
     * Handle work experience updates
     */
    const handleWorkExperienceUpdate = useCallback(
        (workExperienceData) => {
            setCvData((prevData) => {
                const newData = {
                    ...prevData,
                    [SECTIONS.WORK_EXPERIENCE]: workExperienceData,
                };
                if (onDataChange) {
                    onDataChange(newData);
                }
                return newData;
            });
        },
        [onDataChange]
    );

    /**
     * Handle clear all data
     */
    const handleClearData = useCallback(() => {
        if (
            window.confirm(
                "Are you sure you want to clear all CV data? This action cannot be undone."
            )
        ) {
            setCvData(DEFAULT_CV_DATA);
            if (onDataChange) {
                onDataChange(DEFAULT_CV_DATA);
            }
        }
    }, [onDataChange]);

    /**
     * Handle export to JSON
     */
    const handleExportJSON = useCallback(() => {
        try {
            const dataString = JSON.stringify(cvData, null, 2);
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
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export CV data");
        }
    }, [cvData]);

    /**
     * Handle export to PDF
     */
    const handleExportPDF = useCallback(async () => {
        console.log("PDF export button clicked");

        if (!previewRef.current) {
            alert("Preview not available for export");
            return;
        }

        try {
            // Find the CV document element within the preview
            const cvDocument = previewRef.current.querySelector(
                ".cv-document-export"
            );

            console.log("CV document element found:", !!cvDocument);

            if (!cvDocument) {
                alert(
                    "CV content not found for export. Please make sure you have filled out some CV information."
                );
                return;
            }

            console.log("Starting PDF export...");
            const result = await exportToPDF(cvData, cvDocument);

            if (result.success) {
                console.log(`PDF exported successfully: ${result.filename}`);
                // Show success message to user
                alert(
                    `PDF exported successfully! Check your Downloads folder for: ${result.filename}`
                );
            }
        } catch (error) {
            console.error("PDF export error:", error);
            alert(`Failed to export PDF: ${error.message}`);
        }
    }, [cvData]);

    /**
     * Handle export to Word
     */
    const handleExportWord = useCallback(async () => {
        console.log("Word export button clicked");

        try {
            console.log("Starting Word export...");
            const result = await exportToWord(cvData);

            if (result.success) {
                console.log(
                    `Word document exported successfully: ${result.filename}`
                );
                // Show success message to user
                alert(
                    `Word document exported successfully! Check your Downloads folder for: ${result.filename}`
                );
            }
        } catch (error) {
            console.error("Word export error:", error);
            alert(`Failed to export Word document: ${error.message}`);
        }
    }, [cvData]);

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

    return (
        <div className={`${styles.cvBuilder} ${className}`}>
            {/* Header with controls */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>CV Builder</h1>

                    <div className={styles.headerActions}>
                        <button
                            type="button"
                            onClick={handleExportJSON}
                            disabled={!hasData}
                            className={styles.exportButton}
                            title="Export CV data as JSON"
                        >
                            📄 Export JSON
                        </button>

                        <button
                            type="button"
                            onClick={handleExportPDF}
                            disabled={!hasData}
                            className={styles.exportButton}
                            title="Export CV as PDF"
                        >
                            📄 Export PDF
                        </button>

                        <button
                            type="button"
                            onClick={handleExportWord}
                            disabled={!hasData}
                            className={styles.exportButton}
                            title="Export CV as Word document"
                        >
                            📄 Export Word
                        </button>

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

            {/* Main content */}
            <div className={styles.content}>
                {/* Left side - Form inputs */}
                <div className={styles.formPanel}>
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

                {/* Right side - Live preview */}
                <div className={styles.previewPanel} ref={previewRef}>
                    <CVPreview cvData={cvData} />
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <div className={styles.footerContent}>
                    <p className={styles.footerText}>
                        {hasData
                            ? `Your CV contains data in ${[
                                  cvData[SECTIONS.PERSONAL_INFO].name ? 1 : 0,
                                  cvData[SECTIONS.EDUCATION].length > 0 ? 1 : 0,
                                  cvData[SECTIONS.WORK_EXPERIENCE].length > 0
                                      ? 1
                                      : 0,
                              ].reduce((a, b) => a + b, 0)} section${
                                  [
                                      cvData[SECTIONS.PERSONAL_INFO].name
                                          ? 1
                                          : 0,
                                      cvData[SECTIONS.EDUCATION].length > 0
                                          ? 1
                                          : 0,
                                      cvData[SECTIONS.WORK_EXPERIENCE].length >
                                      0
                                          ? 1
                                          : 0,
                                  ].reduce((a, b) => a + b, 0) !== 1
                                      ? "s"
                                      : ""
                              }`
                            : "Start building your CV by adding your personal information"}
                    </p>
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
};

export default CVBuilder;
