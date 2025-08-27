/**
 * Helper functions for data manipulation
 */

import {
    DEFAULT_EDUCATION_ENTRY,
    DEFAULT_WORK_EXPERIENCE_ENTRY,
    EDUCATION_FIELDS,
    WORK_EXPERIENCE_FIELDS,
} from "../models/dataTypes.js";

/**
 * Generates a unique ID for new entries
 * @returns {string} Unique identifier
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Creates a new education entry with default values
 * @returns {Object} New education entry object
 */
export const createNewEducationEntry = () => ({
    ...DEFAULT_EDUCATION_ENTRY,
    [EDUCATION_FIELDS.ID]: generateId(),
});

/**
 * Creates a new work experience entry with default values
 * @returns {Object} New work experience entry object
 */
export const createNewWorkExperienceEntry = () => ({
    ...DEFAULT_WORK_EXPERIENCE_ENTRY,
    [WORK_EXPERIENCE_FIELDS.ID]: generateId(),
});

/**
 * Sorts education entries chronologically (oldest to newest)
 * @param {Array} educationEntries - Array of education entries
 * @returns {Array} Sorted array of education entries
 */
export const sortEducationEntries = (educationEntries) => {
    return [...educationEntries].sort((a, b) => {
        const dateA = new Date(a[EDUCATION_FIELDS.START_DATE] || "1900-01-01");
        const dateB = new Date(b[EDUCATION_FIELDS.START_DATE] || "1900-01-01");
        return dateA - dateB;
    });
};

/**
 * Sorts work experience entries in reverse chronological order (newest to oldest)
 * @param {Array} workExperienceEntries - Array of work experience entries
 * @returns {Array} Sorted array of work experience entries
 */
export const sortWorkExperienceEntries = (workExperienceEntries) => {
    return [...workExperienceEntries].sort((a, b) => {
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

        // Sort by start date (newest first)
        const dateA = new Date(
            a[WORK_EXPERIENCE_FIELDS.START_DATE] || "1900-01-01"
        );
        const dateB = new Date(
            b[WORK_EXPERIENCE_FIELDS.START_DATE] || "1900-01-01"
        );
        return dateB - dateA;
    });
};

/**
 * Removes an entry from an array by ID
 * @param {Array} entries - Array of entries
 * @param {string} idToRemove - ID of the entry to remove
 * @returns {Array} New array without the specified entry
 */
export const removeEntryById = (entries, idToRemove) => {
    return entries.filter((entry) => entry.id !== idToRemove);
};

/**
 * Updates an entry in an array by ID
 * @param {Array} entries - Array of entries
 * @param {string} idToUpdate - ID of the entry to update
 * @param {Object} updatedData - New data for the entry
 * @returns {Array} New array with the updated entry
 */
export const updateEntryById = (entries, idToUpdate, updatedData) => {
    return entries.map((entry) =>
        entry.id === idToUpdate ? { ...entry, ...updatedData } : entry
    );
};

/**
 * Finds an entry in an array by ID
 * @param {Array} entries - Array of entries
 * @param {string} idToFind - ID of the entry to find
 * @returns {Object|null} Found entry or null
 */
export const findEntryById = (entries, idToFind) => {
    return entries.find((entry) => entry.id === idToFind) || null;
};

/**
 * Formats a date string for display
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        });
    } catch (error) {
        return dateString;
    }
};

/**
 * Formats a date range for display
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @param {boolean} isCurrent - Whether this is a current position/study
 * @returns {string} Formatted date range string
 */
export const formatDateRange = (startDate, endDate, isCurrent = false) => {
    const formattedStart = formatDate(startDate);

    if (isCurrent) {
        return `${formattedStart} - Present`;
    }

    const formattedEnd = formatDate(endDate);
    return `${formattedStart} - ${formattedEnd}`;
};

/**
 * Validates if an object has all required fields
 * @param {Object} obj - Object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {boolean} True if all required fields are present and not empty
 */
export const hasRequiredFields = (obj, requiredFields) => {
    return requiredFields.every(
        (field) => obj[field] && obj[field].toString().trim().length > 0
    );
};

/**
 * Deep clones an object to avoid mutation
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Checks if two objects are equal (deep comparison)
 * @param {any} obj1 - First object
 * @param {any} obj2 - Second object
 * @returns {boolean} True if objects are equal
 */
export const isEqual = (obj1, obj2) => {
    // Handle primitive types and null/undefined
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    if (typeof obj1 !== typeof obj2) return false;

    // Handle arrays
    if (Array.isArray(obj1)) {
        if (!Array.isArray(obj2) || obj1.length !== obj2.length) return false;
        return obj1.every((item, index) => isEqual(item, obj2[index]));
    }

    // Handle objects
    if (typeof obj1 === "object") {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        return keys1.every(
            (key) => keys2.includes(key) && isEqual(obj1[key], obj2[key])
        );
    }

    // Handle primitives
    return obj1 === obj2;
};
