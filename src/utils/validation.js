/**
 * Validation utility functions for form fields
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (supports international formats)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

/**
 * Validates if a value is not empty
 * @param {string} value - The value to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateRequired = (value) => {
    if (!value || value.toString().trim().length === 0) {
        return "This field is required";
    }
    return null;
};

/**
 * Validates name field
 * @param {string} name - The name to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateName = (name) => {
    const requiredError = validateRequired(name);
    if (requiredError) return requiredError;

    if (name.trim().length < 2) {
        return "Name must be at least 2 characters long";
    }

    if (name.trim().length > 100) {
        return "Name must be less than 100 characters";
    }

    return null;
};

/**
 * Validates email field
 * @param {string} email - The email to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateEmail = (email) => {
    const requiredError = validateRequired(email);
    if (requiredError) return requiredError;

    if (!EMAIL_REGEX.test(email.trim())) {
        return "Please enter a valid email address";
    }

    return null;
};

/**
 * Validates phone field
 * @param {string} phone - The phone number to validate
 * @returns {string|null} Error message or null if valid
 */
export const validatePhone = (phone) => {
    const requiredError = validateRequired(phone);
    if (requiredError) return requiredError;

    // Remove common phone number formatting characters
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, "");

    if (!PHONE_REGEX.test(cleanPhone)) {
        return "Please enter a valid phone number";
    }

    return null;
};

/**
 * Validates date field
 * @param {string} date - The date to validate (YYYY-MM-DD format)
 * @returns {string|null} Error message or null if valid
 */
export const validateDate = (date) => {
    const requiredError = validateRequired(date);
    if (requiredError) return requiredError;

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return "Please enter a valid date";
    }

    // Check if date is not in the future (for end dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateObj > today) {
        return "Date cannot be in the future";
    }

    return null;
};

/**
 * Validates date range (start date should be before end date)
 * @param {string} startDate - The start date
 * @param {string} endDate - The end date
 * @returns {string|null} Error message or null if valid
 */
export const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
        return null; // Individual date validation will handle required fields
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
        return "Start date must be before end date";
    }

    return null;
};

/**
 * Validates text field with length constraints
 * @param {string} text - The text to validate
 * @param {number} minLength - Minimum length (default: 1)
 * @param {number} maxLength - Maximum length (default: 500)
 * @returns {string|null} Error message or null if valid
 */
export const validateText = (text, minLength = 1, maxLength = 500) => {
    const requiredError = validateRequired(text);
    if (requiredError) return requiredError;

    if (text.trim().length < minLength) {
        return `Text must be at least ${minLength} character${
            minLength > 1 ? "s" : ""
        } long`;
    }

    if (text.trim().length > maxLength) {
        return `Text must be less than ${maxLength} characters`;
    }

    return null;
};

/**
 * Validates responsibilities field (multi-line text)
 * @param {string} responsibilities - The responsibilities text to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateResponsibilities = (responsibilities) => {
    return validateText(responsibilities, 10, 2000);
};

/**
 * Validation rules mapping for different field types
 */
export const VALIDATION_RULES = {
    name: validateName,
    email: validateEmail,
    phone: validatePhone,
    date: validateDate,
    text: validateText,
    responsibilities: validateResponsibilities,
    required: validateRequired,
};
