import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/FormField.module.css";

/**
 * Reusable TextArea component for multi-line input with validation and error display
 */
const TextArea = ({
    label,
    value,
    onChange,
    placeholder = "",
    required = false,
    rows = 4,
    error = null,
    id,
    className = "",
    disabled = false,
    maxLength,
    ...props
}) => {
    const inputId =
        id || `textarea-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const hasError = Boolean(error);

    return (
        <div className={`${styles.fieldContainer} ${className}`}>
            <label
                htmlFor={inputId}
                className={`${styles.label} ${required ? styles.required : ""}`}
            >
                {label}
                {required && (
                    <span
                        className={styles.requiredIndicator}
                        aria-label="required"
                    >
                        *
                    </span>
                )}
            </label>

            <textarea
                id={inputId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                className={`${styles.textarea} ${
                    hasError ? styles.inputError : ""
                }`}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${inputId}-error` : undefined}
                {...props}
            />

            {maxLength && (
                <div className={styles.characterCount}>
                    {value.length}/{maxLength}
                </div>
            )}

            {hasError && (
                <div
                    id={`${inputId}-error`}
                    className={styles.errorMessage}
                    role="alert"
                    aria-live="polite"
                >
                    {error}
                </div>
            )}
        </div>
    );
};

TextArea.propTypes = {
    /** Label text for the textarea field */
    label: PropTypes.string.isRequired,
    /** Current value of the textarea */
    value: PropTypes.string.isRequired,
    /** Callback function called when textarea value changes */
    onChange: PropTypes.func.isRequired,
    /** Placeholder text for the textarea */
    placeholder: PropTypes.string,
    /** Whether the field is required */
    required: PropTypes.bool,
    /** Number of visible text lines */
    rows: PropTypes.number,
    /** Error message to display */
    error: PropTypes.string,
    /** Custom ID for the textarea element */
    id: PropTypes.string,
    /** Additional CSS class names */
    className: PropTypes.string,
    /** Whether the textarea is disabled */
    disabled: PropTypes.bool,
    /** Maximum number of characters allowed */
    maxLength: PropTypes.number,
};

export default TextArea;
