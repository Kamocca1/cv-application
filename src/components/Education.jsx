import React, { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import EditableSection from "./EditableSection.jsx";
import TextInput from "./TextInput.jsx";
import DateInput from "./DateInput.jsx";
import {
    DEFAULT_EDUCATION_ENTRY,
    EDUCATION_FIELDS,
    SECTIONS,
} from "../models/dataTypes.js";
import {
    validateRequired,
    validateDate,
    validateDateRange,
} from "../utils/validation.js";
import styles from "../styles/Education.module.css";

/**
 * Education Component
 * Manages educational background entries with edit/display functionality
 */
const Education = ({
    data = [],
    onUpdate,
    className = "",
    disabled = false,
}) => {
    // Generate unique ID for new education entries
    const generateId = useCallback(() => {
        return `education_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
    }, []);

    // Sort education entries chronologically (most recent first)
    const sortEducationEntries = useCallback((entries) => {
        return [...entries].sort((a, b) => {
            const dateA = new Date(
                a[EDUCATION_FIELDS.END_DATE] || a[EDUCATION_FIELDS.START_DATE]
            );
            const dateB = new Date(
                b[EDUCATION_FIELDS.END_DATE] || b[EDUCATION_FIELDS.START_DATE]
            );
            return dateB - dateA; // Most recent first
        });
    }, []);

    // Validation rules for education fields
    const validationRules = useMemo(() => {
        // Custom validation function for the entries array
        const validateEntries = (entries) => {
            if (!Array.isArray(entries) || entries.length === 0) {
                return "At least one education entry is required";
            }

            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];

                // Validate school name
                const schoolNameError = validateRequired(
                    entry[EDUCATION_FIELDS.SCHOOL_NAME]
                );
                if (schoolNameError) {
                    return `Entry ${i + 1}: School name is required`;
                }

                // Validate title of study
                const titleError = validateRequired(
                    entry[EDUCATION_FIELDS.TITLE_OF_STUDY]
                );
                if (titleError) {
                    return `Entry ${i + 1}: Title of study is required`;
                }

                // Validate start date
                const startDateError = validateDate(
                    entry[EDUCATION_FIELDS.START_DATE]
                );
                if (startDateError) {
                    return `Entry ${i + 1}: ${startDateError}`;
                }

                // Validate end date
                const endDateError = validateDate(
                    entry[EDUCATION_FIELDS.END_DATE]
                );
                if (endDateError) {
                    return `Entry ${i + 1}: ${endDateError}`;
                }

                // Validate date range
                const dateRangeError = validateDateRange(
                    entry[EDUCATION_FIELDS.START_DATE],
                    entry[EDUCATION_FIELDS.END_DATE]
                );
                if (dateRangeError) {
                    return `Entry ${i + 1}: ${dateRangeError}`;
                }
            }

            return null;
        };

        return {
            entries: validateEntries,
        };
    }, []);

    // Handle save callback
    const handleSave = useCallback(
        (educationData) => {
            const sortedData = sortEducationEntries(
                educationData.entries || []
            );
            if (onUpdate) {
                onUpdate(sortedData);
            }
        },
        [onUpdate, sortEducationEntries]
    );

    // Add new education entry
    const addEducationEntry = useCallback(
        (entries, onFieldChange) => {
            const newEntry = {
                ...DEFAULT_EDUCATION_ENTRY,
                [EDUCATION_FIELDS.ID]: generateId(),
            };
            const updatedEntries = [...entries, newEntry];
            onFieldChange("entries", updatedEntries);
        },
        [generateId]
    );

    // Remove education entry
    const removeEducationEntry = useCallback(
        (entries, entryId, onFieldChange) => {
            const updatedEntries = entries.filter(
                (entry) => entry[EDUCATION_FIELDS.ID] !== entryId
            );
            onFieldChange("entries", updatedEntries);
        },
        []
    );

    // Update specific education entry
    const updateEducationEntry = useCallback(
        (entries, entryId, field, value, onFieldChange) => {
            const updatedEntries = entries.map((entry) =>
                entry[EDUCATION_FIELDS.ID] === entryId
                    ? { ...entry, [field]: value }
                    : entry
            );
            onFieldChange("entries", updatedEntries);
        },
        []
    );

    // Render edit form
    const renderEditForm = ({ data: localData, onFieldChange }) => {
        const entries = localData.entries || [];

        return (
            <div className={styles.editForm}>
                <div className={styles.educationEntries}>
                    {entries.map((entry, index) => (
                        <div
                            key={entry[EDUCATION_FIELDS.ID]}
                            className={styles.educationEntry}
                        >
                            <div className={styles.entryHeader}>
                                <h3 className={styles.entryTitle}>
                                    Education Entry {index + 1}
                                </h3>
                                {entries.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeEducationEntry(
                                                entries,
                                                entry[EDUCATION_FIELDS.ID],
                                                onFieldChange
                                            )
                                        }
                                        className={styles.removeButton}
                                        aria-label={`Remove education entry ${
                                            index + 1
                                        }`}
                                    >
                                        <span className={styles.removeIcon}>
                                            ✕
                                        </span>
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div className={styles.entryFields}>
                                <TextInput
                                    label="School Name"
                                    value={entry[EDUCATION_FIELDS.SCHOOL_NAME]}
                                    onChange={(value) =>
                                        updateEducationEntry(
                                            entries,
                                            entry[EDUCATION_FIELDS.ID],
                                            EDUCATION_FIELDS.SCHOOL_NAME,
                                            value,
                                            onFieldChange
                                        )
                                    }
                                    placeholder="Enter school or university name"
                                    required
                                    className={styles.schoolField}
                                />

                                <TextInput
                                    label="Title of Study"
                                    value={
                                        entry[EDUCATION_FIELDS.TITLE_OF_STUDY]
                                    }
                                    onChange={(value) =>
                                        updateEducationEntry(
                                            entries,
                                            entry[EDUCATION_FIELDS.ID],
                                            EDUCATION_FIELDS.TITLE_OF_STUDY,
                                            value,
                                            onFieldChange
                                        )
                                    }
                                    placeholder="e.g., Bachelor of Science in Computer Science"
                                    required
                                    className={styles.titleField}
                                />

                                <div className={styles.dateFields}>
                                    <DateInput
                                        label="Start Date"
                                        value={
                                            entry[EDUCATION_FIELDS.START_DATE]
                                        }
                                        onChange={(value) =>
                                            updateEducationEntry(
                                                entries,
                                                entry[EDUCATION_FIELDS.ID],
                                                EDUCATION_FIELDS.START_DATE,
                                                value,
                                                onFieldChange
                                            )
                                        }
                                        required
                                        max={
                                            entry[EDUCATION_FIELDS.END_DATE] ||
                                            undefined
                                        }
                                        className={styles.startDateField}
                                    />

                                    <DateInput
                                        label="End Date"
                                        value={entry[EDUCATION_FIELDS.END_DATE]}
                                        onChange={(value) =>
                                            updateEducationEntry(
                                                entries,
                                                entry[EDUCATION_FIELDS.ID],
                                                EDUCATION_FIELDS.END_DATE,
                                                value,
                                                onFieldChange
                                            )
                                        }
                                        required
                                        min={
                                            entry[
                                                EDUCATION_FIELDS.START_DATE
                                            ] || undefined
                                        }
                                        className={styles.endDateField}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => addEducationEntry(entries, onFieldChange)}
                    className={styles.addButton}
                    aria-label="Add new education entry"
                >
                    <span className={styles.addIcon}>+</span>
                    Add Education Entry
                </button>
            </div>
        );
    };

    // Format date for display
    const formatDate = useCallback((dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
            });
        } catch (error) {
            return dateString;
        }
    }, []);

    // Render display view
    const renderDisplayView = ({ data: localData }) => {
        const entries = localData.entries || [];
        const sortedEntries = sortEducationEntries(entries);

        if (sortedEntries.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>🎓</div>
                    <div className={styles.emptyStateText}>
                        No education entries added yet
                    </div>
                    <div className={styles.emptyStateSubtext}>
                        Click "Edit" to add your educational background
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.displayView}>
                <div className={styles.educationList}>
                    {sortedEntries.map((entry) => (
                        <div
                            key={entry[EDUCATION_FIELDS.ID]}
                            className={styles.educationItem}
                        >
                            <div className={styles.educationHeader}>
                                <h3 className={styles.schoolName}>
                                    {entry[EDUCATION_FIELDS.SCHOOL_NAME]}
                                </h3>
                                <div className={styles.dateRange}>
                                    {formatDate(
                                        entry[EDUCATION_FIELDS.START_DATE]
                                    )}{" "}
                                    -{" "}
                                    {formatDate(
                                        entry[EDUCATION_FIELDS.END_DATE]
                                    )}
                                </div>
                            </div>
                            <p className={styles.titleOfStudy}>
                                {entry[EDUCATION_FIELDS.TITLE_OF_STUDY]}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Prepare data for EditableSection (wrap array in object for validation)
    const sectionData = useMemo(
        () => ({
            entries: data,
        }),
        [data]
    );

    return (
        <div className={`${styles.education} ${className}`}>
            <EditableSection
                sectionId={SECTIONS.EDUCATION}
                title="Education"
                icon="🎓"
                data={sectionData}
                onSave={handleSave}
                validationRules={validationRules}
                disabled={disabled}
                className={styles.editableSection}
            >
                {({ isEditing, ...props }) =>
                    isEditing ? renderEditForm(props) : renderDisplayView(props)
                }
            </EditableSection>
        </div>
    );
};

Education.propTypes = {
    /** Array of education entries */
    data: PropTypes.arrayOf(
        PropTypes.shape({
            [EDUCATION_FIELDS.ID]: PropTypes.string,
            [EDUCATION_FIELDS.SCHOOL_NAME]: PropTypes.string,
            [EDUCATION_FIELDS.TITLE_OF_STUDY]: PropTypes.string,
            [EDUCATION_FIELDS.START_DATE]: PropTypes.string,
            [EDUCATION_FIELDS.END_DATE]: PropTypes.string,
        })
    ),
    /** Callback function called when education data is updated */
    onUpdate: PropTypes.func.isRequired,
    /** Additional CSS class names */
    className: PropTypes.string,
    /** Whether the component is disabled */
    disabled: PropTypes.bool,
};

export default Education;
