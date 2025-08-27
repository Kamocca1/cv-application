import React, { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import EditableSection from "./EditableSection.jsx";
import TextInput from "./TextInput.jsx";
import TextArea from "./TextArea.jsx";
import DateInput from "./DateInput.jsx";
import {
    DEFAULT_WORK_EXPERIENCE_ENTRY,
    WORK_EXPERIENCE_FIELDS,
    SECTIONS,
} from "../models/dataTypes.js";
import {
    validateRequired,
    validateDate,
    validateDateRange,
    validateResponsibilities,
} from "../utils/validation.js";
import styles from "../styles/WorkExperience.module.css";

/**
 * WorkExperience Component
 * Manages work experience entries with edit/display functionality
 */
const WorkExperience = ({
    data = [],
    onUpdate,
    className = "",
    disabled = false,
}) => {
    // Generate unique ID for new work experience entries
    const generateId = useCallback(() => {
        return `work_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    // Sort work experience entries in reverse chronological order (most recent first)
    const sortWorkExperienceEntries = useCallback((entries) => {
        return [...entries].sort((a, b) => {
            // Current jobs should appear first
            if (
                a[WORK_EXPERIENCE_FIELDS.IS_CURRENT] &&
                !b[WORK_EXPERIENCE_FIELDS.IS_CURRENT]
            ) {
                return -1;
            }
            if (
                !a[WORK_EXPERIENCE_FIELDS.IS_CURRENT] &&
                b[WORK_EXPERIENCE_FIELDS.IS_CURRENT]
            ) {
                return 1;
            }

            // Then sort by start date (most recent first)
            const dateA = new Date(
                a[WORK_EXPERIENCE_FIELDS.START_DATE] || "1900-01-01"
            );
            const dateB = new Date(
                b[WORK_EXPERIENCE_FIELDS.START_DATE] || "1900-01-01"
            );
            return dateB - dateA;
        });
    }, []);

    // Validation rules for work experience fields
    const validationRules = useMemo(() => {
        // Custom validation function for the entries array
        const validateEntries = (entries) => {
            if (!Array.isArray(entries) || entries.length === 0) {
                return "At least one work experience entry is required";
            }

            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];

                // Validate company name
                const companyNameError = validateRequired(
                    entry[WORK_EXPERIENCE_FIELDS.COMPANY_NAME]
                );
                if (companyNameError) {
                    return `Entry ${i + 1}: Company name is required`;
                }

                // Validate position title
                const positionError = validateRequired(
                    entry[WORK_EXPERIENCE_FIELDS.POSITION_TITLE]
                );
                if (positionError) {
                    return `Entry ${i + 1}: Position title is required`;
                }

                // Validate responsibilities
                const responsibilitiesError = validateResponsibilities(
                    entry[WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES]
                );
                if (responsibilitiesError) {
                    return `Entry ${i + 1}: ${responsibilitiesError}`;
                }

                // Validate start date
                const startDateError = validateDate(
                    entry[WORK_EXPERIENCE_FIELDS.START_DATE]
                );
                if (startDateError) {
                    return `Entry ${i + 1}: ${startDateError}`;
                }

                // Validate end date (only if not current job)
                if (!entry[WORK_EXPERIENCE_FIELDS.IS_CURRENT]) {
                    const endDateError = validateDate(
                        entry[WORK_EXPERIENCE_FIELDS.END_DATE]
                    );
                    if (endDateError) {
                        return `Entry ${i + 1}: ${endDateError}`;
                    }

                    // Validate date range
                    const dateRangeError = validateDateRange(
                        entry[WORK_EXPERIENCE_FIELDS.START_DATE],
                        entry[WORK_EXPERIENCE_FIELDS.END_DATE]
                    );
                    if (dateRangeError) {
                        return `Entry ${i + 1}: ${dateRangeError}`;
                    }
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
        (workExperienceData) => {
            const sortedData = sortWorkExperienceEntries(
                workExperienceData.entries || []
            );
            if (onUpdate) {
                onUpdate(sortedData);
            }
        },
        [onUpdate, sortWorkExperienceEntries]
    );

    // Add new work experience entry
    const addWorkExperienceEntry = useCallback(
        (entries, onFieldChange) => {
            const newEntry = {
                ...DEFAULT_WORK_EXPERIENCE_ENTRY,
                [WORK_EXPERIENCE_FIELDS.ID]: generateId(),
            };
            const updatedEntries = [...entries, newEntry];
            onFieldChange("entries", updatedEntries);
        },
        [generateId]
    );

    // Remove work experience entry
    const removeWorkExperienceEntry = useCallback(
        (entries, entryId, onFieldChange) => {
            const updatedEntries = entries.filter(
                (entry) => entry[WORK_EXPERIENCE_FIELDS.ID] !== entryId
            );
            onFieldChange("entries", updatedEntries);
        },
        []
    );

    // Update specific work experience entry
    const updateWorkExperienceEntry = useCallback(
        (entries, entryId, field, value, onFieldChange) => {
            const updatedEntries = entries.map((entry) => {
                if (entry[WORK_EXPERIENCE_FIELDS.ID] === entryId) {
                    const updatedEntry = { ...entry, [field]: value };

                    // If setting as current job, clear end date
                    if (
                        field === WORK_EXPERIENCE_FIELDS.IS_CURRENT &&
                        value === true
                    ) {
                        updatedEntry[WORK_EXPERIENCE_FIELDS.END_DATE] = "";
                    }

                    return updatedEntry;
                }
                return entry;
            });
            onFieldChange("entries", updatedEntries);
        },
        []
    );

    // Render edit form
    const renderEditForm = ({ data: localData, onFieldChange }) => {
        const entries = localData.entries || [];

        return (
            <div className={styles.editForm}>
                <div className={styles.experienceEntries}>
                    {entries.map((entry, index) => (
                        <div
                            key={entry[WORK_EXPERIENCE_FIELDS.ID]}
                            className={styles.experienceEntry}
                        >
                            <div className={styles.entryHeader}>
                                <h3 className={styles.entryTitle}>
                                    Work Experience Entry {index + 1}
                                </h3>
                                {entries.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeWorkExperienceEntry(
                                                entries,
                                                entry[
                                                    WORK_EXPERIENCE_FIELDS.ID
                                                ],
                                                onFieldChange
                                            )
                                        }
                                        className={styles.removeButton}
                                        aria-label={`Remove work experience entry ${
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
                                <div className={styles.basicFields}>
                                    <TextInput
                                        label="Company Name"
                                        value={
                                            entry[
                                                WORK_EXPERIENCE_FIELDS
                                                    .COMPANY_NAME
                                            ]
                                        }
                                        onChange={(value) =>
                                            updateWorkExperienceEntry(
                                                entries,
                                                entry[
                                                    WORK_EXPERIENCE_FIELDS.ID
                                                ],
                                                WORK_EXPERIENCE_FIELDS.COMPANY_NAME,
                                                value,
                                                onFieldChange
                                            )
                                        }
                                        placeholder="Enter company name"
                                        required
                                        className={styles.companyField}
                                    />

                                    <TextInput
                                        label="Position Title"
                                        value={
                                            entry[
                                                WORK_EXPERIENCE_FIELDS
                                                    .POSITION_TITLE
                                            ]
                                        }
                                        onChange={(value) =>
                                            updateWorkExperienceEntry(
                                                entries,
                                                entry[
                                                    WORK_EXPERIENCE_FIELDS.ID
                                                ],
                                                WORK_EXPERIENCE_FIELDS.POSITION_TITLE,
                                                value,
                                                onFieldChange
                                            )
                                        }
                                        placeholder="e.g., Software Engineer"
                                        required
                                        className={styles.positionField}
                                    />
                                </div>

                                <div className={styles.dateFields}>
                                    <DateInput
                                        label="Start Date"
                                        value={
                                            entry[
                                                WORK_EXPERIENCE_FIELDS
                                                    .START_DATE
                                            ]
                                        }
                                        onChange={(value) =>
                                            updateWorkExperienceEntry(
                                                entries,
                                                entry[
                                                    WORK_EXPERIENCE_FIELDS.ID
                                                ],
                                                WORK_EXPERIENCE_FIELDS.START_DATE,
                                                value,
                                                onFieldChange
                                            )
                                        }
                                        required
                                        max={
                                            entry[
                                                WORK_EXPERIENCE_FIELDS.END_DATE
                                            ] || undefined
                                        }
                                        className={styles.startDateField}
                                    />

                                    {!entry[
                                        WORK_EXPERIENCE_FIELDS.IS_CURRENT
                                    ] && (
                                        <DateInput
                                            label="End Date"
                                            value={
                                                entry[
                                                    WORK_EXPERIENCE_FIELDS
                                                        .END_DATE
                                                ]
                                            }
                                            onChange={(value) =>
                                                updateWorkExperienceEntry(
                                                    entries,
                                                    entry[
                                                        WORK_EXPERIENCE_FIELDS
                                                            .ID
                                                    ],
                                                    WORK_EXPERIENCE_FIELDS.END_DATE,
                                                    value,
                                                    onFieldChange
                                                )
                                            }
                                            required={
                                                !entry[
                                                    WORK_EXPERIENCE_FIELDS
                                                        .IS_CURRENT
                                                ]
                                            }
                                            min={
                                                entry[
                                                    WORK_EXPERIENCE_FIELDS
                                                        .START_DATE
                                                ] || undefined
                                            }
                                            className={styles.endDateField}
                                        />
                                    )}
                                </div>

                                <div className={styles.currentJobField}>
                                    <input
                                        type="checkbox"
                                        id={`current-job-${
                                            entry[WORK_EXPERIENCE_FIELDS.ID]
                                        }`}
                                        checked={
                                            entry[
                                                WORK_EXPERIENCE_FIELDS
                                                    .IS_CURRENT
                                            ]
                                        }
                                        onChange={(e) =>
                                            updateWorkExperienceEntry(
                                                entries,
                                                entry[
                                                    WORK_EXPERIENCE_FIELDS.ID
                                                ],
                                                WORK_EXPERIENCE_FIELDS.IS_CURRENT,
                                                e.target.checked,
                                                onFieldChange
                                            )
                                        }
                                        className={styles.currentJobCheckbox}
                                    />
                                    <label
                                        htmlFor={`current-job-${
                                            entry[WORK_EXPERIENCE_FIELDS.ID]
                                        }`}
                                        className={styles.currentJobLabel}
                                    >
                                        This is my current job
                                    </label>
                                </div>

                                <div className={styles.responsibilitiesField}>
                                    <TextArea
                                        label="Main Responsibilities"
                                        value={
                                            entry[
                                                WORK_EXPERIENCE_FIELDS
                                                    .RESPONSIBILITIES
                                            ]
                                        }
                                        onChange={(value) =>
                                            updateWorkExperienceEntry(
                                                entries,
                                                entry[
                                                    WORK_EXPERIENCE_FIELDS.ID
                                                ],
                                                WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES,
                                                value,
                                                onFieldChange
                                            )
                                        }
                                        placeholder="Describe your main responsibilities and achievements..."
                                        required
                                        rows={4}
                                        maxLength={2000}
                                        className={
                                            styles.responsibilitiesTextArea
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() =>
                        addWorkExperienceEntry(entries, onFieldChange)
                    }
                    className={styles.addButton}
                    aria-label="Add new work experience entry"
                >
                    <span className={styles.addIcon}>+</span>
                    Add Work Experience Entry
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
        const sortedEntries = sortWorkExperienceEntries(entries);

        if (sortedEntries.length === 0) {
            return (
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>💼</div>
                    <div className={styles.emptyStateText}>
                        No work experience entries added yet
                    </div>
                    <div className={styles.emptyStateSubtext}>
                        Click "Edit" to add your professional experience
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.displayView}>
                <div className={styles.experienceList}>
                    {sortedEntries.map((entry) => (
                        <div
                            key={entry[WORK_EXPERIENCE_FIELDS.ID]}
                            className={styles.experienceItem}
                        >
                            {entry[WORK_EXPERIENCE_FIELDS.IS_CURRENT] && (
                                <div className={styles.currentJobBadge}>
                                    Current
                                </div>
                            )}

                            <div className={styles.experienceHeader}>
                                <div>
                                    <h3 className={styles.positionTitle}>
                                        {
                                            entry[
                                                WORK_EXPERIENCE_FIELDS
                                                    .POSITION_TITLE
                                            ]
                                        }
                                    </h3>
                                    <p className={styles.companyName}>
                                        {
                                            entry[
                                                WORK_EXPERIENCE_FIELDS
                                                    .COMPANY_NAME
                                            ]
                                        }
                                    </p>
                                </div>
                                <div className={styles.dateRange}>
                                    {formatDate(
                                        entry[WORK_EXPERIENCE_FIELDS.START_DATE]
                                    )}{" "}
                                    -{" "}
                                    {entry[WORK_EXPERIENCE_FIELDS.IS_CURRENT]
                                        ? "Present"
                                        : formatDate(
                                              entry[
                                                  WORK_EXPERIENCE_FIELDS
                                                      .END_DATE
                                              ]
                                          )}
                                </div>
                            </div>

                            {entry[WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES] && (
                                <div className={styles.responsibilities}>
                                    <div
                                        className={styles.responsibilitiesTitle}
                                    >
                                        Key Responsibilities
                                    </div>
                                    <div
                                        className={styles.responsibilitiesText}
                                    >
                                        {
                                            entry[
                                                WORK_EXPERIENCE_FIELDS
                                                    .RESPONSIBILITIES
                                            ]
                                        }
                                    </div>
                                </div>
                            )}
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
        <div className={`${styles.workExperience} ${className}`}>
            <EditableSection
                sectionId={SECTIONS.WORK_EXPERIENCE}
                title="Work Experience"
                icon="💼"
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

WorkExperience.propTypes = {
    /** Array of work experience entries */
    data: PropTypes.arrayOf(
        PropTypes.shape({
            [WORK_EXPERIENCE_FIELDS.ID]: PropTypes.string,
            [WORK_EXPERIENCE_FIELDS.COMPANY_NAME]: PropTypes.string,
            [WORK_EXPERIENCE_FIELDS.POSITION_TITLE]: PropTypes.string,
            [WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES]: PropTypes.string,
            [WORK_EXPERIENCE_FIELDS.START_DATE]: PropTypes.string,
            [WORK_EXPERIENCE_FIELDS.END_DATE]: PropTypes.string,
            [WORK_EXPERIENCE_FIELDS.IS_CURRENT]: PropTypes.bool,
        })
    ),
    /** Callback function called when work experience data is updated */
    onUpdate: PropTypes.func.isRequired,
    /** Additional CSS class names */
    className: PropTypes.string,
    /** Whether the component is disabled */
    disabled: PropTypes.bool,
};

export default WorkExperience;
