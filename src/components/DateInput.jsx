import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/FormField.module.css";

/**
 * Reusable DateInput component with validation and error display
 */
const DateInput = ({
    label,
    value,
    onChange,
    required = false,
    error = null,
    id,
    className = "",
    disabled = false,
    min,
    max,
    ...props
}) => {
    const inputId =
        id || `date-input-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const hasError = Boolean(error);

    // Format date value for display (ensure it's in YYYY-MM-DD format)
    const formatDateValue = (dateValue) => {
        if (!dateValue) return "";

        // If it's already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }

        // Try to parse and format the date
        try {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split("T")[0];
            }
        } catch (e) {
            // If parsing fails, return empty string
        }

        return "";
    };

    const formattedValue = formatDateValue(value);

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

            <input
                id={inputId}
                type="date"
                value={formattedValue}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                disabled={disabled}
                min={min}
                max={max}
                className={`${styles.input} ${styles.dateInput} ${
                    hasError ? styles.inputError : ""
                }`}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${inputId}-error` : undefined}
                {...props}
            />

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

DateInput.propTypes = {
    /** Label text for the date input field */
    label: PropTypes.string.isRequired,
    /** Current value of the date input (YYYY-MM-DD format) */
    value: PropTypes.string.isRequired,
    /** Callback function called when date value changes */
    onChange: PropTypes.func.isRequired,
    /** Whether the field is required */
    required: PropTypes.bool,
    /** Error message to display */
    error: PropTypes.string,
    /** Custom ID for the input element */
    id: PropTypes.string,
    /** Additional CSS class names */
    className: PropTypes.string,
    /** Whether the input is disabled */
    disabled: PropTypes.bool,
    /** Minimum date value (YYYY-MM-DD format) */
    min: PropTypes.string,
    /** Maximum date value (YYYY-MM-DD format) */
    max: PropTypes.string,
};

export default DateInput;
