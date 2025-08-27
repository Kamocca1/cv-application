import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import PersonalInfo from "../components/PersonalInfo.jsx";
import Education from "../components/Education.jsx";
import WorkExperience from "../components/WorkExperience.jsx";
import {
    validateName,
    validateEmail,
    validatePhone,
    validateDate,
    validateDateRange,
    validateResponsibilities,
    validateFormData,
    validateMultipleFields,
} from "../utils/validation.js";
import {
    DEFAULT_PERSONAL_INFO,
    PERSONAL_INFO_FIELDS,
    EDUCATION_FIELDS,
    WORK_EXPERIENCE_FIELDS,
} from "../models/dataTypes.js";

// Mock CSS modules
vi.mock("../styles/PersonalInfo.module.css", () => ({ default: {} }));
vi.mock("../styles/Education.module.css", () => ({ default: {} }));
vi.mock("../styles/WorkExperience.module.css", () => ({ default: {} }));
vi.mock("../styles/EditableSection.module.css", () => ({ default: {} }));
vi.mock("../styles/FormField.module.css", () => ({ default: {} }));

describe("Comprehensive Form Validation", () => {
    const user = userEvent.setup();

    describe("Real-time Validation", () => {
        it("validates name field in real-time on blur", async () => {
            const mockOnUpdate = vi.fn();
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // Enter edit mode
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // Type invalid name and blur
            const nameInput = screen.getByLabelText(/full name/i);
            await user.type(nameInput, "A");
            await user.tab(); // Trigger blur

            await waitFor(() => {
                expect(nameInput).toHaveAttribute("aria-invalid", "true");
            });
        });

        it("validates email field in real-time on blur", async () => {
            const mockOnUpdate = vi.fn();
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // Enter edit mode
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // Type invalid email and blur
            const emailInput = screen.getByLabelText(/email address/i);
            await user.type(emailInput, "invalid-email");
            await user.tab(); // Trigger blur

            await waitFor(() => {
                expect(emailInput).toHaveAttribute("aria-invalid", "true");
            });
        });

        it("clears validation errors when field becomes valid", async () => {
            const mockOnUpdate = vi.fn();
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // Enter edit mode
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // Type invalid email and blur
            const emailInput = screen.getByLabelText(/email address/i);
            await user.type(emailInput, "invalid");
            await user.tab();

            await waitFor(() => {
                expect(emailInput).toHaveAttribute("aria-invalid", "true");
            });

            // Fix the email
            await user.clear(emailInput);
            await user.type(emailInput, "valid@example.com");
            await user.tab();

            await waitFor(() => {
                expect(emailInput).toHaveAttribute("aria-invalid", "false");
            });
        });
    });

    describe("Form-level Validation", () => {
        it("prevents form submission when validation errors exist", async () => {
            const mockOnUpdate = vi.fn();
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // Enter edit mode
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // Try to save without filling required fields
            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                expect(saveButton).toBeDisabled();
                expect(mockOnUpdate).not.toHaveBeenCalled();
            });
        });

        it("shows validation summary when multiple errors exist", async () => {
            const mockOnUpdate = vi.fn();
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // Enter edit mode
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // Try to save without filling required fields
            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                expect(
                    screen.getByText(/please fix the following errors/i)
                ).toBeInTheDocument();
            });
        });

        it("allows form submission when all fields are valid", async () => {
            const mockOnUpdate = vi.fn();
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // Enter edit mode
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // Fill all required fields with valid data
            const nameInput = screen.getByLabelText(/full name/i);
            const emailInput = screen.getByLabelText(/email address/i);
            const phoneInput = screen.getByLabelText(/phone number/i);

            await user.type(nameInput, "John Doe");
            await user.type(emailInput, "john@example.com");
            await user.type(phoneInput, "+1234567890");

            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                expect(mockOnUpdate).toHaveBeenCalledWith({
                    [PERSONAL_INFO_FIELDS.NAME]: "John Doe",
                    [PERSONAL_INFO_FIELDS.EMAIL]: "john@example.com",
                    [PERSONAL_INFO_FIELDS.PHONE]: "+1234567890",
                });
            });
        });
    });

    describe("Cross-field Validation", () => {
        it("validates date ranges in education entries", async () => {
            const mockOnUpdate = vi.fn();
            const educationData = [
                {
                    [EDUCATION_FIELDS.ID]: "edu1",
                    [EDUCATION_FIELDS.SCHOOL_NAME]: "Test University",
                    [EDUCATION_FIELDS.TITLE_OF_STUDY]: "Test Degree",
                    [EDUCATION_FIELDS.START_DATE]: "2023-01-01",
                    [EDUCATION_FIELDS.END_DATE]: "2022-01-01", // Invalid: end before start
                },
            ];

            render(<Education data={educationData} onUpdate={mockOnUpdate} />);

            // Enter edit mode
            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            // Try to save with invalid date range
            const saveButton = screen.getByRole("button", {
                name: /save education/i,
            });
            await user.click(saveButton);

            await waitFor(() => {
                expect(saveButton).toBeDisabled();
                expect(
                    screen.getByText(/start date must be before end date/i)
                ).toBeInTheDocument();
            });
        });

        it("validates work experience date ranges", async () => {
            const mockOnUpdate = vi.fn();
            const workData = [
                {
                    [WORK_EXPERIENCE_FIELDS.ID]: "work1",
                    [WORK_EXPERIENCE_FIELDS.COMPANY_NAME]: "Test Company",
                    [WORK_EXPERIENCE_FIELDS.POSITION_TITLE]: "Test Position",
                    [WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES]:
                        "Test responsibilities that are long enough to pass validation",
                    [WORK_EXPERIENCE_FIELDS.START_DATE]: "2023-01-01",
                    [WORK_EXPERIENCE_FIELDS.END_DATE]: "2022-01-01", // Invalid: end before start
                    [WORK_EXPERIENCE_FIELDS.IS_CURRENT]: false,
                },
            ];

            render(<WorkExperience data={workData} onUpdate={mockOnUpdate} />);

            // Enter edit mode
            const editButton = screen.getByRole("button", {
                name: /edit work experience/i,
            });
            await user.click(editButton);

            // Try to save with invalid date range
            const saveButton = screen.getByRole("button", {
                name: /save work experience/i,
            });
            await user.click(saveButton);

            await waitFor(() => {
                expect(saveButton).toBeDisabled();
                expect(
                    screen.getByText(/start date must be before end date/i)
                ).toBeInTheDocument();
            });
        });
    });

    describe("Validation Utility Functions", () => {
        describe("validateName", () => {
            it("validates name correctly", () => {
                expect(validateName("")).toBe("This field is required");
                expect(validateName("A")).toBe(
                    "Name must be at least 2 characters long"
                );
                expect(validateName("John Doe")).toBe(null);
                expect(validateName("A".repeat(101))).toBe(
                    "Name must be less than 100 characters"
                );
            });
        });

        describe("validateEmail", () => {
            it("validates email correctly", () => {
                expect(validateEmail("")).toBe("This field is required");
                expect(validateEmail("invalid")).toBe(
                    "Please enter a valid email address"
                );
                expect(validateEmail("test@example.com")).toBe(null);
                expect(validateEmail("user+tag@domain.co.uk")).toBe(null);
            });
        });

        describe("validatePhone", () => {
            it("validates phone correctly", () => {
                expect(validatePhone("")).toBe("This field is required");
                expect(validatePhone("invalid")).toBe(
                    "Please enter a valid phone number"
                );
                expect(validatePhone("+1234567890")).toBe(null);
                expect(validatePhone("(555) 123-4567")).toBe(null);
            });
        });

        describe("validateDate", () => {
            it("validates date correctly", () => {
                expect(validateDate("")).toBe("This field is required");
                expect(validateDate("invalid")).toBe(
                    "Please enter a valid date"
                );
                expect(validateDate("2023-01-01")).toBe(null);

                // Future date should be invalid
                const futureDate = new Date();
                futureDate.setFullYear(futureDate.getFullYear() + 1);
                const futureDateString = futureDate.toISOString().split("T")[0];
                expect(validateDate(futureDateString)).toBe(
                    "Date cannot be in the future"
                );
            });
        });

        describe("validateDateRange", () => {
            it("validates date range correctly", () => {
                expect(validateDateRange("2023-01-01", "2022-01-01")).toBe(
                    "Start date must be before end date"
                );
                expect(validateDateRange("2022-01-01", "2023-01-01")).toBe(
                    null
                );
                expect(validateDateRange("", "2023-01-01")).toBe(null); // Handles empty dates
            });
        });

        describe("validateResponsibilities", () => {
            it("validates responsibilities correctly", () => {
                expect(validateResponsibilities("")).toBe(
                    "This field is required"
                );
                expect(validateResponsibilities("Short")).toBe(
                    "Text must be at least 10 characters long"
                );
                expect(
                    validateResponsibilities(
                        "This is a valid responsibility description"
                    )
                ).toBe(null);
                expect(validateResponsibilities("A".repeat(2001))).toBe(
                    "Text must be less than 2000 characters"
                );
            });
        });

        describe("validateFormData", () => {
            it("validates form data with schema", () => {
                const data = {
                    name: "John",
                    email: "invalid-email",
                    phone: "+1234567890",
                };

                const schema = {
                    name: validateName,
                    email: validateEmail,
                    phone: validatePhone,
                };

                const result = validateFormData(data, schema);

                expect(result.isValid).toBe(false);
                expect(result.hasErrors).toBe(true);
                expect(result.errorCount).toBe(1);
                expect(result.errors.email).toBe(
                    "Please enter a valid email address"
                );
                expect(result.errors.name).toBeUndefined();
                expect(result.errors.phone).toBeUndefined();
            });

            it("returns valid result for correct data", () => {
                const data = {
                    name: "John Doe",
                    email: "john@example.com",
                    phone: "+1234567890",
                };

                const schema = {
                    name: validateName,
                    email: validateEmail,
                    phone: validatePhone,
                };

                const result = validateFormData(data, schema);

                expect(result.isValid).toBe(true);
                expect(result.hasErrors).toBe(false);
                expect(result.errorCount).toBe(0);
                expect(Object.keys(result.errors)).toHaveLength(0);
            });
        });

        describe("validateMultipleFields", () => {
            it("validates multiple fields correctly", () => {
                const data = {
                    name: "",
                    email: "invalid",
                    phone: "+1234567890",
                };

                const rules = {
                    name: validateName,
                    email: validateEmail,
                    phone: validatePhone,
                };

                const errors = validateMultipleFields(data, rules);

                expect(errors.name).toBe("This field is required");
                expect(errors.email).toBe("Please enter a valid email address");
                expect(errors.phone).toBeUndefined();
            });
        });
    });

    describe("Error Message Display", () => {
        it("displays user-friendly error messages", async () => {
            const mockOnUpdate = vi.fn();
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // Enter edit mode
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // Type invalid data
            const nameInput = screen.getByLabelText(/full name/i);
            const emailInput = screen.getByLabelText(/email address/i);

            await user.type(nameInput, "A");
            await user.type(emailInput, "invalid");
            await user.tab();

            // Try to save
            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                expect(
                    screen.getAllByText(
                        "Name must be at least 2 characters long"
                    )
                ).toHaveLength(2); // One in summary, one in field error
                expect(
                    screen.getAllByText("Please enter a valid email address")
                ).toHaveLength(2); // One in summary, one in field error
            });
        });

        it("shows validation errors with proper ARIA attributes", async () => {
            const mockOnUpdate = vi.fn();
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // Enter edit mode
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // Try to save without filling fields
            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                const nameInput = screen.getByLabelText(/full name/i);
                expect(nameInput).toHaveAttribute("aria-invalid", "true");
                expect(nameInput).toHaveAttribute("aria-describedby");

                // Check that error messages have proper role
                const errorMessages = screen.getAllByRole("alert");
                expect(errorMessages.length).toBeGreaterThan(0);
            });
        });
    });

    describe("Accessibility", () => {
        it("announces validation errors to screen readers", async () => {
            const mockOnUpdate = vi.fn();
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // Enter edit mode
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // Try to save without filling fields
            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                // Check for aria-live regions in field error messages
                const fieldErrorMessages = screen
                    .getAllByRole("alert")
                    .filter(
                        (element) =>
                            element.getAttribute("aria-live") === "polite"
                    );
                expect(fieldErrorMessages.length).toBeGreaterThan(0);

                // Check that validation summary exists
                const validationSummary = screen.getByText(
                    /please fix the following errors/i
                );
                expect(
                    validationSummary.closest('[role="alert"]')
                ).toBeInTheDocument();
            });
        });

        it("maintains focus management during validation", async () => {
            const mockOnUpdate = vi.fn();
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // Enter edit mode
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const nameInput = screen.getByLabelText(/full name/i);
            nameInput.focus();

            // Type invalid data and blur
            await user.type(nameInput, "A");
            await user.tab();

            await waitFor(() => {
                expect(nameInput).toHaveAttribute("aria-invalid", "true");
                // Focus should move to next field, not be trapped
                expect(document.activeElement).not.toBe(nameInput);
            });
        });
    });
});
