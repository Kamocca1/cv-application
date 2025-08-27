import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/FormField.module.css";

/**
 * Reusable TextInput component with validation and error display
 */
const TextInput = ({
    label,
    value,
    onChange,
    placeholder = "",
    required = false,
    type = "text",
    error = null,
    id,
    className = "",
    disabled = false,
    ...props
}) => {
    const inputId =
        id || `text-input-${label.toLowerCase().replace(/\s+/g, "-")}`;
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

            <input
                id={inputId}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`${styles.input} ${
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

TextInput.propTypes = {
    /** Label text for the input field */
    label: PropTypes.string.isRequired,
    /** Current value of the input */
    value: PropTypes.string.isRequired,
    /** Callback function called when input value changes */
    onChange: PropTypes.func.isRequired,
    /** Placeholder text for the input */
    placeholder: PropTypes.string,
    /** Whether the field is required */
    required: PropTypes.bool,
    /** Input type (text, email, tel, etc.) */
    type: PropTypes.oneOf(["text", "email", "tel", "password", "url"]),
    /** Error message to display */
    error: PropTypes.string,
    /** Custom ID for the input element */
    id: PropTypes.string,
    /** Additional CSS class names */
    className: PropTypes.string,
    /** Whether the input is disabled */
    disabled: PropTypes.bool,
};

export default TextInput;
