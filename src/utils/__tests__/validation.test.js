/**
 * Tests for validation utilities
 */

import {
    validateName,
    validateEmail,
    validatePhone,
    validateDate,
    validateDateRange,
    validateText,
    validateResponsibilities,
    validateRequired,
} from "../validation.js";

// Test validateRequired
console.log("Testing validateRequired...");
console.assert(
    validateRequired("") === "This field is required",
    "Empty string should be invalid"
);
console.assert(
    validateRequired("   ") === "This field is required",
    "Whitespace only should be invalid"
);
console.assert(validateRequired("valid") === null, "Valid string should pass");

// Test validateName
console.log("Testing validateName...");
console.assert(
    validateName("") === "This field is required",
    "Empty name should be invalid"
);
console.assert(
    validateName("A") === "Name must be at least 2 characters long",
    "Single character should be invalid"
);
console.assert(validateName("John Doe") === null, "Valid name should pass");

// Test validateEmail
console.log("Testing validateEmail...");
console.assert(
    validateEmail("") === "This field is required",
    "Empty email should be invalid"
);
console.assert(
    validateEmail("invalid-email") === "Please enter a valid email address",
    "Invalid email should fail"
);
console.assert(
    validateEmail("test@example.com") === null,
    "Valid email should pass"
);

// Test validatePhone
console.log("Testing validatePhone...");
console.assert(
    validatePhone("") === "This field is required",
    "Empty phone should be invalid"
);
console.assert(
    validatePhone("123-456-7890") === null,
    "Valid phone with dashes should pass"
);
console.assert(
    validatePhone("+1234567890") === null,
    "Valid international phone should pass"
);

// Test validateDate
console.log("Testing validateDate...");
console.assert(
    validateDate("") === "This field is required",
    "Empty date should be invalid"
);
console.assert(
    validateDate("invalid-date") === "Please enter a valid date",
    "Invalid date should fail"
);
console.assert(
    validateDate("2020-01-01") === null,
    "Valid past date should pass"
);

// Test validateDateRange
console.log("Testing validateDateRange...");
console.assert(
    validateDateRange("2020-01-01", "2019-01-01") ===
        "Start date must be before end date",
    "Invalid date range should fail"
);
console.assert(
    validateDateRange("2019-01-01", "2020-01-01") === null,
    "Valid date range should pass"
);

// Test validateText
console.log("Testing validateText...");
console.assert(
    validateText("") === "This field is required",
    "Empty text should be invalid"
);
console.assert(validateText("Valid text") === null, "Valid text should pass");

// Test validateResponsibilities
console.log("Testing validateResponsibilities...");
console.assert(
    validateResponsibilities("") === "This field is required",
    "Empty responsibilities should be invalid"
);
console.assert(
    validateResponsibilities("Short") ===
        "Text must be at least 10 characters long",
    "Too short responsibilities should be invalid"
);
console.assert(
    validateResponsibilities(
        "This is a valid responsibility description that is long enough"
    ) === null,
    "Valid responsibilities should pass"
);

console.log("All validation tests passed!");
