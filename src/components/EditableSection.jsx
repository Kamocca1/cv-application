import React, { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import styles from "../styles/EditableSection.module.css";

/**
 * EditableSection Higher-Order Component
 * Provides edit/display mode switching, form validation, and button functionality
 */
const EditableSection = ({
    sectionId,
    title,
    icon,
    data,
    onSave,
    onCancel,
    validationRules = {},
    children,
    className = "",
    disabled = false,
    autoSave = false,
    autoSaveDelay = 1000,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localData, setLocalData] = useState(data);
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

    // Update local data when prop data changes (external updates)
    React.useEffect(() => {
        if (!isEditing) {
            setLocalData(data);
        }
    }, [data, isEditing]);

    // Validate a single field
    const validateField = useCallback(
        (fieldName, value) => {
            const rule = validationRules[fieldName];
            if (!rule) return null;

            if (typeof rule === "function") {
                return rule(value);
            }

            if (typeof rule === "object" && rule.validator) {
                return rule.validator(value);
            }

            return null;
        },
        [validationRules]
    );

    // Validate all fields
    const validateAllFields = useCallback(() => {
        const errors = {};
        let hasErrors = false;

        Object.keys(validationRules).forEach((fieldName) => {
            const value = localData[fieldName];
            const error = validateField(fieldName, value);
            if (error) {
                errors[fieldName] = error;
                hasErrors = true;
            }
        });

        setValidationErrors(errors);
        return !hasErrors;
    }, [localData, validationRules, validateField]);

    // Handle field changes
    const handleFieldChange = useCallback(
        (fieldName, value) => {
            const newData = { ...localData, [fieldName]: value };
            setLocalData(newData);

            // Clear validation error for this field
            if (validationErrors[fieldName]) {
                setValidationErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName];
                    return newErrors;
                });
            }

            // Auto-save functionality
            if (autoSave && isEditing) {
                if (autoSaveTimeout) {
                    clearTimeout(autoSaveTimeout);
                }

                const timeout = setTimeout(() => {
                    const isValid = validateAllFields();
                    if (isValid) {
                        handleSave(newData, true); // Silent auto-save
                    }
                }, autoSaveDelay);

                setAutoSaveTimeout(timeout);
            }
        },
        [
            localData,
            validationErrors,
            autoSave,
            isEditing,
            autoSaveTimeout,
            autoSaveDelay,
            validateAllFields,
        ]
    );

    // Handle edit mode
    const handleEdit = useCallback(() => {
        if (disabled) return;
        setIsEditing(true);
        setLocalData(data);
        setValidationErrors({});
    }, [data, disabled]);

    // Handle save
    const handleSave = useCallback(
        async (dataToSave = localData, silent = false) => {
            if (!silent) {
                setIsLoading(true);
            }

            try {
                const isValid = validateAllFields();
                if (!isValid) {
                    if (!silent) {
                        setIsLoading(false);
                    }
                    return false;
                }

                if (onSave) {
                    await onSave(dataToSave);
                }

                if (!silent) {
                    setIsEditing(false);
                    setValidationErrors({});
                }

                return true;
            } catch (error) {
                console.error("Error saving data:", error);
                // You might want to show a user-friendly error message here
                return false;
            } finally {
                if (!silent) {
                    setIsLoading(false);
                }
            }
        },
        [localData, validateAllFields, onSave]
    );

    // Handle cancel
    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setLocalData(data);
        setValidationErrors({});

        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
            setAutoSaveTimeout(null);
        }

        if (onCancel) {
            onCancel();
        }
    }, [data, autoSaveTimeout, onCancel]);

    // Handle submit (form submission)
    const handleSubmit = useCallback(
        (e) => {
            if (e) {
                e.preventDefault();
            }
            handleSave();
        },
        [handleSave]
    );

    // Check if form has validation errors
    const hasValidationErrors = useMemo(() => {
        return Object.keys(validationErrors).length > 0;
    }, [validationErrors]);

    // Check if data has changed
    const hasChanges = useMemo(() => {
        return JSON.stringify(localData) !== JSON.stringify(data);
    }, [localData, data]);

    // Cleanup auto-save timeout on unmount
    React.useEffect(() => {
        return () => {
            if (autoSaveTimeout) {
                clearTimeout(autoSaveTimeout);
            }
        };
    }, [autoSaveTimeout]);

    // Child props to pass to render function
    const childProps = {
        isEditing,
        data: localData,
        validationErrors,
        onFieldChange: handleFieldChange,
        onSubmit: handleSubmit,
        onEdit: handleEdit,
        onCancel: handleCancel,
        hasValidationErrors,
        hasChanges,
        disabled,
    };

    return (
        <div
            className={`${styles.editableSection} ${className}`}
            data-testid={`editable-section-${sectionId}`}
        >
            <div
                className={`${styles.sectionWrapper} ${
                    isEditing ? styles.editingMode : styles.displayMode
                }`}
            >
                {/* Section Header */}
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        {icon && (
                            <span className={styles.sectionIcon}>{icon}</span>
                        )}
                        {title}
                    </h2>

                    <div className={styles.sectionActions}>
                        {/* Status Indicator */}
                        <div className={styles.statusIndicator}>
                            <div
                                className={`${styles.statusDot} ${
                                    isEditing
                                        ? styles.editing
                                        : hasChanges
                                        ? styles.saved
                                        : ""
                                }`}
                            />
                            <span>
                                {isEditing
                                    ? "Editing"
                                    : hasChanges
                                    ? "Saved"
                                    : "Ready"}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={handleEdit}
                                disabled={disabled}
                                className={`${styles.actionButton} ${styles.editButton}`}
                                aria-label={`Edit ${title}`}
                            >
                                <span className={styles.buttonIcon}>✏️</span>
                                Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className={`${styles.actionButton} ${styles.cancelButton}`}
                                    aria-label={`Cancel editing ${title}`}
                                >
                                    <span className={styles.buttonIcon}>✕</span>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={isLoading || hasValidationErrors}
                                    className={`${styles.actionButton} ${styles.submitButton}`}
                                    aria-label={`Save ${title}`}
                                >
                                    <span className={styles.buttonIcon}>
                                        {isLoading ? "⏳" : "✓"}
                                    </span>
                                    {isLoading ? "Saving..." : "Save"}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Validation Summary */}
                {isEditing && hasValidationErrors && (
                    <div className={styles.validationSummary} role="alert">
                        <div className={styles.validationTitle}>
                            <span>⚠️</span>
                            Please fix the following errors:
                        </div>
                        <ul className={styles.validationList}>
                            {Object.entries(validationErrors).map(
                                ([field, error]) => (
                                    <li
                                        key={field}
                                        className={styles.validationItem}
                                    >
                                        {error}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                )}

                {/* Section Content */}
                <div className={styles.sectionContent}>
                    {isLoading && (
                        <div className={styles.loadingOverlay}>
                            <div className={styles.loadingSpinner} />
                        </div>
                    )}

                    <div className={styles.contentWrapper}>
                        {typeof children === "function"
                            ? children(childProps)
                            : children}
                    </div>
                </div>
            </div>
        </div>
    );
};

EditableSection.propTypes = {
    /** Unique identifier for the section */
    sectionId: PropTypes.string.isRequired,
    /** Title to display in the section header */
    title: PropTypes.string.isRequired,
    /** Optional icon to display next to the title */
    icon: PropTypes.string,
    /** Data object for the section */
    data: PropTypes.object.isRequired,
    /** Callback function called when data is saved */
    onSave: PropTypes.func.isRequired,
    /** Callback function called when editing is cancelled */
    onCancel: PropTypes.func,
    /** Validation rules object mapping field names to validation functions */
    validationRules: PropTypes.object,
    /** Children can be a function or React elements */
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
    /** Additional CSS class names */
    className: PropTypes.string,
    /** Whether the section is disabled */
    disabled: PropTypes.bool,
    /** Whether to enable auto-save functionality */
    autoSave: PropTypes.bool,
    /** Delay in milliseconds for auto-save */
    autoSaveDelay: PropTypes.number,
};

export default EditableSection;
