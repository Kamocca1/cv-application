import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PersonalInfo from "../components/PersonalInfo.jsx";
import {
    DEFAULT_PERSONAL_INFO,
    PERSONAL_INFO_FIELDS,
} from "../models/dataTypes.js";

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

describe("PersonalInfo Component", () => {
    const mockOnUpdate = vi.fn();
    const user = userEvent.setup();

    const sampleData = {
        [PERSONAL_INFO_FIELDS.NAME]: "John Doe",
        [PERSONAL_INFO_FIELDS.EMAIL]: "john.doe@example.com",
        [PERSONAL_INFO_FIELDS.PHONE]: "+1 (555) 123-4567",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendering", () => {
        it("renders with default empty data", () => {
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            expect(
                screen.getByText("Personal Information")
            ).toBeInTheDocument();
            expect(
                screen.getByText("No personal information added yet")
            ).toBeInTheDocument();
            expect(
                screen.getByText('Click "Edit" to add your contact details')
            ).toBeInTheDocument();
        });

        it("renders with provided data in display mode", () => {
            render(<PersonalInfo data={sampleData} onUpdate={mockOnUpdate} />);

            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(
                screen.getByText("john.doe@example.com")
            ).toBeInTheDocument();
            expect(screen.getByText("+1 (555) 123-4567")).toBeInTheDocument();
        });

        it("renders email and phone as clickable links", () => {
            render(<PersonalInfo data={sampleData} onUpdate={mockOnUpdate} />);

            const emailLink = screen.getByRole("link", {
                name: "john.doe@example.com",
            });
            const phoneLink = screen.getByRole("link", {
                name: "+1 (555) 123-4567",
            });

            expect(emailLink).toHaveAttribute(
                "href",
                "mailto:john.doe@example.com"
            );
            expect(phoneLink).toHaveAttribute("href", "tel:+1 (555) 123-4567");
        });

        it("applies custom className", () => {
            const { container } = render(
                <PersonalInfo
                    data={sampleData}
                    onUpdate={mockOnUpdate}
                    className="custom-class"
                />
            );

            expect(container.firstChild).toHaveClass(
                "personalInfo",
                "custom-class"
            );
        });

        it("renders as disabled when disabled prop is true", () => {
            render(
                <PersonalInfo
                    data={sampleData}
                    onUpdate={mockOnUpdate}
                    disabled
                />
            );

            const editButton = screen.getByRole("button", {
                name: /edit personal information/i,
            });
            expect(editButton).toBeDisabled();
        });
    });

    describe("Edit Mode", () => {
        it("switches to edit mode when edit button is clicked", async () => {
            render(<PersonalInfo data={sampleData} onUpdate={mockOnUpdate} />);

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
        });

        it("populates form fields with existing data in edit mode", async () => {
            render(<PersonalInfo data={sampleData} onUpdate={mockOnUpdate} />);

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("john.doe@example.com")
            ).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("+1 (555) 123-4567")
            ).toBeInTheDocument();
        });

        it("shows save and cancel buttons in edit mode", async () => {
            render(<PersonalInfo data={sampleData} onUpdate={mockOnUpdate} />);

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            expect(
                screen.getByRole("button", { name: /save/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /cancel/i })
            ).toBeInTheDocument();
            // Check that edit button text is not visible (button is replaced)
            expect(screen.queryByText("Edit")).not.toBeInTheDocument();
        });

        it("has correct input types for form fields", async () => {
            render(<PersonalInfo data={sampleData} onUpdate={mockOnUpdate} />);

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const nameInput = screen.getByLabelText(/full name/i);
            const emailInput = screen.getByLabelText(/email address/i);
            const phoneInput = screen.getByLabelText(/phone number/i);

            expect(nameInput).toHaveAttribute("type", "text");
            expect(emailInput).toHaveAttribute("type", "email");
            expect(phoneInput).toHaveAttribute("type", "tel");
        });

        it("shows required indicators for all fields", async () => {
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const requiredIndicators = screen.getAllByText("*");
            expect(requiredIndicators).toHaveLength(3);
        });
    });

    describe("Form Validation", () => {
        it("validates name field - shows error for empty name", async () => {
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                // Check for error in the name field specifically
                const nameInput = screen.getByLabelText(/full name/i);
                expect(nameInput).toHaveAttribute("aria-invalid", "true");
                expect(
                    screen.getAllByText("This field is required")
                ).toHaveLength(6);
            });
        });

        it("validates name field - shows error for name too short", async () => {
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const nameInput = screen.getByLabelText(/full name/i);
            await user.type(nameInput, "A");

            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                // Check for specific error message in name field
                const nameInput = screen.getByLabelText(/full name/i);
                expect(nameInput).toHaveAttribute("aria-invalid", "true");
                expect(
                    screen.getAllByText(
                        "Name must be at least 2 characters long"
                    )
                ).toHaveLength(2);
            });
        });

        it("validates email field - shows error for invalid email", async () => {
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const nameInput = screen.getByLabelText(/full name/i);
            const emailInput = screen.getByLabelText(/email address/i);

            await user.type(nameInput, "John Doe");
            await user.type(emailInput, "invalid-email");

            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                // Check for specific error message in email field
                const emailInput = screen.getByLabelText(/email address/i);
                expect(emailInput).toHaveAttribute("aria-invalid", "true");
                expect(
                    screen.getAllByText("Please enter a valid email address")
                ).toHaveLength(2);
            });
        });

        it("validates phone field - shows error for invalid phone", async () => {
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const nameInput = screen.getByLabelText(/full name/i);
            const emailInput = screen.getByLabelText(/email address/i);
            const phoneInput = screen.getByLabelText(/phone number/i);

            await user.type(nameInput, "John Doe");
            await user.type(emailInput, "john@example.com");
            await user.type(phoneInput, "invalid-phone");

            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                // Check for specific error message in phone field
                const phoneInput = screen.getByLabelText(/phone number/i);
                expect(phoneInput).toHaveAttribute("aria-invalid", "true");
                expect(
                    screen.getAllByText("Please enter a valid phone number")
                ).toHaveLength(2);
            });
        });

        it("disables save button when validation errors exist", async () => {
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                expect(saveButton).toBeDisabled();
            });
        });
    });

    describe("Data Handling", () => {
        it("calls onUpdate with correct data when form is saved", async () => {
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const nameInput = screen.getByLabelText(/full name/i);
            const emailInput = screen.getByLabelText(/email address/i);
            const phoneInput = screen.getByLabelText(/phone number/i);

            await user.type(nameInput, "Jane Smith");
            await user.type(emailInput, "jane.smith@example.com");
            await user.type(phoneInput, "+1 (555) 987-6543");

            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                expect(mockOnUpdate).toHaveBeenCalledWith({
                    [PERSONAL_INFO_FIELDS.NAME]: "Jane Smith",
                    [PERSONAL_INFO_FIELDS.EMAIL]: "jane.smith@example.com",
                    [PERSONAL_INFO_FIELDS.PHONE]: "+1 (555) 987-6543",
                });
            });
        });

        it("returns to display mode after successful save", async () => {
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const nameInput = screen.getByLabelText(/full name/i);
            const emailInput = screen.getByLabelText(/email address/i);
            const phoneInput = screen.getByLabelText(/phone number/i);

            await user.type(nameInput, "Jane Smith");
            await user.type(emailInput, "jane.smith@example.com");
            await user.type(phoneInput, "+1 (555) 987-6543");

            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                expect(
                    screen.getByRole("button", { name: /edit/i })
                ).toBeInTheDocument();
                expect(
                    screen.queryByRole("button", { name: /save/i })
                ).not.toBeInTheDocument();
            });
        });

        it("cancels editing and reverts to original data", async () => {
            render(<PersonalInfo data={sampleData} onUpdate={mockOnUpdate} />);

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const nameInput = screen.getByLabelText(/full name/i);
            await user.clear(nameInput);
            await user.type(nameInput, "Changed Name");

            const cancelButton = screen.getByRole("button", {
                name: /cancel/i,
            });
            await user.click(cancelButton);

            // Should return to display mode with original data
            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.queryByText("Changed Name")).not.toBeInTheDocument();
            expect(mockOnUpdate).not.toHaveBeenCalled();
        });
    });

    describe("Accessibility", () => {
        it("has proper ARIA labels and roles", async () => {
            render(<PersonalInfo data={sampleData} onUpdate={mockOnUpdate} />);

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const nameInput = screen.getByLabelText(/full name/i);
            const emailInput = screen.getByLabelText(/email address/i);
            const phoneInput = screen.getByLabelText(/phone number/i);

            expect(nameInput).toHaveAttribute("aria-invalid", "false");
            expect(emailInput).toHaveAttribute("aria-invalid", "false");
            expect(phoneInput).toHaveAttribute("aria-invalid", "false");
        });

        it("sets aria-invalid to true when validation errors exist", async () => {
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                const nameInput = screen.getByLabelText(/full name/i);
                expect(nameInput).toHaveAttribute("aria-invalid", "true");
            });
        });

        it("associates error messages with form fields", async () => {
            render(
                <PersonalInfo
                    data={DEFAULT_PERSONAL_INFO}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                const nameInput = screen.getByLabelText(/full name/i);
                const errorId = nameInput.getAttribute("aria-describedby");
                expect(errorId).toBeTruthy();
                // Check that there are multiple alert elements (validation summary + field errors)
                expect(screen.getAllByRole("alert")).toHaveLength(4); // 1 summary + 3 field errors
            });
        });
    });

    describe("Edge Cases", () => {
        it("handles missing onUpdate prop gracefully", async () => {
            // Should not throw error even without onUpdate
            render(<PersonalInfo data={sampleData} />);

            const editButton = screen.getByRole("button", { name: /edit/i });
            await user.click(editButton);

            const saveButton = screen.getByRole("button", { name: /save/i });

            // Should not throw when clicking save without onUpdate
            expect(() => user.click(saveButton)).not.toThrow();
        });

        it("handles partial data correctly", () => {
            const partialData = {
                [PERSONAL_INFO_FIELDS.NAME]: "John Doe",
                [PERSONAL_INFO_FIELDS.EMAIL]: "",
                [PERSONAL_INFO_FIELDS.PHONE]: "",
            };

            render(<PersonalInfo data={partialData} onUpdate={mockOnUpdate} />);

            expect(screen.getByText("John Doe")).toBeInTheDocument();
            expect(screen.queryByText("📧")).not.toBeInTheDocument();
            expect(screen.queryByText("📞")).not.toBeInTheDocument();
        });

        it("handles undefined data prop", () => {
            render(<PersonalInfo onUpdate={mockOnUpdate} />);

            expect(
                screen.getByText("No personal information added yet")
            ).toBeInTheDocument();
        });
    });
});
