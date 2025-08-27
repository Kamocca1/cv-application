import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import PersonalInfo from "../components/PersonalInfo.jsx";
import { DEFAULT_PERSONAL_INFO } from "../models/dataTypes.js";

// Mock CSS modules
vi.mock("../styles/PersonalInfo.module.css", () => ({
    default: {
        personalInfo: "personalInfo",
        editableSection: "editableSection",
        editForm: "editForm",
        formGrid: "formGrid",
        nameField: "nameField",
        emailField: "emailField",
        phoneField: "phoneField",
        displayView: "displayView",
        infoGrid: "infoGrid",
        nameSection: "nameSection",
        name: "name",
        contactInfo: "contactInfo",
        contactItem: "contactItem",
        contactIcon: "contactIcon",
        value: "value",
        emptyState: "emptyState",
        emptyStateText: "emptyStateText",
        emptyStateSubtext: "emptyStateSubtext",
    },
}));

describe("PersonalInfo Integration Tests", () => {
    const user = userEvent.setup();

    describe("Complete User Workflow", () => {
        it("allows user to complete full personal info workflow", async () => {
            const mockOnUpdate = vi.fn();

            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // 1. Initial state - should show empty state
            expect(
                screen.getByText("No personal information added yet")
            ).toBeInTheDocument();

            // 2. Click edit to start adding information
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // 3. Fill out all fields with valid data
            const nameInput = screen.getByLabelText(/full name/i);
            const emailInput = screen.getByLabelText(/email address/i);
            const phoneInput = screen.getByLabelText(/phone number/i);

            await user.type(nameInput, "Jane Smith");
            await user.type(emailInput, "jane.smith@example.com");
            await user.type(phoneInput, "+1 (555) 987-6543");

            // 4. Save the information
            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            // 5. Verify callback was called with correct data
            expect(mockOnUpdate).toHaveBeenCalledWith({
                name: "Jane Smith",
                email: "jane.smith@example.com",
                phone: "+1 (555) 987-6543",
            });

            // 6. Verify we're back in display mode (edit button is visible)
            expect(
                screen.getByRole("button", { name: /edit/i })
            ).toBeInTheDocument();
        });

        it("handles validation errors gracefully in workflow", async () => {
            const mockOnUpdate = vi.fn();

            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // 1. Start editing
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // 2. Enter invalid data
            const nameInput = screen.getByLabelText(/full name/i);
            const emailInput = screen.getByLabelText(/email address/i);

            await user.type(nameInput, "A"); // Too short
            await user.type(emailInput, "invalid-email"); // Invalid format

            // 3. Try to save
            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            // 4. Verify validation errors are shown
            expect(
                screen.getAllByText("Name must be at least 2 characters long")
            ).toHaveLength(2);
            expect(
                screen.getAllByText("Please enter a valid email address")
            ).toHaveLength(2);
            expect(screen.getAllByText("This field is required")).toHaveLength(
                2
            ); // Phone field

            // 5. Verify save button is disabled
            expect(saveButton).toBeDisabled();

            // 6. Verify onUpdate was not called
            expect(mockOnUpdate).not.toHaveBeenCalled();

            // 7. Fix the errors
            await user.clear(nameInput);
            await user.type(nameInput, "Jane Smith");
            await user.clear(emailInput);
            await user.type(emailInput, "jane@example.com");

            const phoneInput = screen.getByLabelText(/phone number/i);
            await user.type(phoneInput, "+1234567890");

            // 8. Save again
            await user.click(saveButton);

            // 9. Verify successful save
            expect(mockOnUpdate).toHaveBeenCalledWith({
                name: "Jane Smith",
                email: "jane@example.com",
                phone: "+1234567890",
            });
        });

        it("allows editing existing data", async () => {
            const mockOnUpdate = vi.fn();
            const existingData = {
                name: "John Doe",
                email: "john@example.com",
                phone: "+1234567890",
            };

            render(
                <PersonalInfo data={existingData} onUpdate={mockOnUpdate} />
            );

            // 1. Verify existing data is displayed
            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.getByText("john@example.com")).toBeInTheDocument();
            expect(screen.getByText("+1234567890")).toBeInTheDocument();

            // 2. Start editing
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // 3. Verify form is populated with existing data
            expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("john@example.com")
            ).toBeInTheDocument();
            expect(screen.getByDisplayValue("+1234567890")).toBeInTheDocument();

            // 4. Modify the name
            const nameInput = screen.getByLabelText(/full name/i);
            await user.clear(nameInput);
            await user.type(nameInput, "John Smith");

            // 5. Save changes
            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            // 6. Verify callback with updated data
            expect(mockOnUpdate).toHaveBeenCalledWith({
                name: "John Smith",
                email: "john@example.com",
                phone: "+1234567890",
            });

            // 7. Verify we're back in display mode
            expect(
                screen.getByRole("button", { name: /edit/i })
            ).toBeInTheDocument();
        });

        it("allows canceling edits", async () => {
            const mockOnUpdate = vi.fn();
            const existingData = {
                name: "John Doe",
                email: "john@example.com",
                phone: "+1234567890",
            };

            render(
                <PersonalInfo data={existingData} onUpdate={mockOnUpdate} />
            );

            // 1. Start editing
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // 2. Make changes
            const nameInput = screen.getByLabelText(/full name/i);
            await user.clear(nameInput);
            await user.type(nameInput, "Changed Name");

            // 3. Cancel editing
            const cancelButton = screen.getByRole("button", {
                name: /cancel/i,
            });
            await user.click(cancelButton);

            // 4. Verify original data is still displayed
            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.queryByText("Changed Name")).not.toBeInTheDocument();

            // 5. Verify onUpdate was not called
            expect(mockOnUpdate).not.toHaveBeenCalled();
        });
    });

    describe("Accessibility Integration", () => {
        it("maintains proper focus management during workflow", async () => {
            const mockOnUpdate = vi.fn();

            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // 1. Tab to edit button and activate
            const editButton = screen.getByRole("button", { name: /edit/i });
            editButton.focus();
            expect(document.activeElement).toBe(editButton);

            await user.keyboard("{Enter}");

            // 2. Verify form fields are accessible via keyboard
            const nameInput = screen.getByLabelText(/full name/i);
            const emailInput = screen.getByLabelText(/email address/i);
            const phoneInput = screen.getByLabelText(/phone number/i);

            // Focus the first input field
            nameInput.focus();
            expect(document.activeElement).toBe(nameInput);

            // Tab to next field
            await user.tab();
            expect(document.activeElement).toBe(emailInput);

            // Tab to next field
            await user.tab();
            expect(document.activeElement).toBe(phoneInput);
        });

        it("provides proper screen reader announcements", async () => {
            const mockOnUpdate = vi.fn();

            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // 1. Start editing
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            // 2. Trigger validation errors
            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            // 3. Verify error messages have proper ARIA attributes
            const nameInput = screen.getByLabelText(/full name/i);
            const emailInput = screen.getByLabelText(/email address/i);
            const phoneInput = screen.getByLabelText(/phone number/i);

            expect(nameInput).toHaveAttribute("aria-invalid", "true");
            expect(emailInput).toHaveAttribute("aria-invalid", "true");
            expect(phoneInput).toHaveAttribute("aria-invalid", "true");

            // 4. Verify error messages are associated with fields
            expect(nameInput.getAttribute("aria-describedby")).toContain(
                "error"
            );
            expect(emailInput.getAttribute("aria-describedby")).toContain(
                "error"
            );
            expect(phoneInput.getAttribute("aria-describedby")).toContain(
                "error"
            );
        });
    });

    describe("Responsive Behavior", () => {
        it("maintains functionality across different viewport sizes", async () => {
            const mockOnUpdate = vi.fn();

            // Test mobile viewport
            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: 375,
            });

            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            // Functionality should work the same regardless of viewport
            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const nameInput = screen.getByLabelText(/full name/i);
            const emailInput = screen.getByLabelText(/email address/i);
            const phoneInput = screen.getByLabelText(/phone number/i);

            await user.type(nameInput, "Mobile User");
            await user.type(emailInput, "mobile@example.com");
            await user.type(phoneInput, "+1234567890");

            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            expect(mockOnUpdate).toHaveBeenCalledWith({
                name: "Mobile User",
                email: "mobile@example.com",
                phone: "+1234567890",
            });
        });
    });
});
