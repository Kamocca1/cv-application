import React, { useState, useCallback } from "react";
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
    validator = null,
    validateOnBlur = true,
    validateOnChange = false,
    ...props
}) => {
    const inputId =
        id ||
        `text-input-${label.toLowerCase().replace(/\s+/g, "-")}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
    const [localError, setLocalError] = useState(null);
    const [touched, setTouched] = useState(false);

    // Use external error if provided, otherwise use local validation error
    const displayError = error || (touched && localError);
    const hasError = Boolean(displayError);

    // Validate the current value
    const validateValue = useCallback(
        (val) => {
            if (!validator) return null;
            return validator(val);
        },
        [validator]
    );

    // Handle input change with optional real-time validation
    const handleChange = useCallback(
        (newValue) => {
            onChange(newValue);

            if (validateOnChange && validator) {
                const validationError = validateValue(newValue);
                setLocalError(validationError);
            } else if (localError && validator) {
                // Clear error if field becomes valid during typing
                const validationError = validateValue(newValue);
                if (!validationError) {
                    setLocalError(null);
                }
            }
        },
        [onChange, validateOnChange, validator, validateValue, localError]
    );

    // Handle input blur with validation
    const handleBlur = useCallback(() => {
        setTouched(true);
        if (validateOnBlur && validator) {
            const validationError = validateValue(value);
            setLocalError(validationError);
        }
    }, [validateOnBlur, validator, validateValue, value]);

    // Handle input focus
    const handleFocus = useCallback(() => {
        // Clear local error on focus if using real-time validation
        if (validateOnChange && localError) {
            setLocalError(null);
        }
    }, [validateOnChange, localError]);

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
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                onFocus={handleFocus}
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
                    {displayError}
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
    /** Error message to display (overrides local validation) */
    error: PropTypes.string,
    /** Custom ID for the input element */
    id: PropTypes.string,
    /** Additional CSS class names */
    className: PropTypes.string,
    /** Whether the input is disabled */
    disabled: PropTypes.bool,
    /** Validation function that returns error message or null */
    validator: PropTypes.func,
    /** Whether to validate on blur event */
    validateOnBlur: PropTypes.bool,
    /** Whether to validate on change event (real-time) */
    validateOnChange: PropTypes.bool,
};

export default TextInput;
