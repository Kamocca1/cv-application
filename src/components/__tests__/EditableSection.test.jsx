import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditableSection from "../EditableSection.jsx";

describe("EditableSection Component", () => {
    const mockData = {
        name: "John Doe",
        email: "john@example.com",
        phone: "123-456-7890",
    };

    const mockValidationRules = {
        name: (value) => (!value ? "Name is required" : null),
        email: (value) => {
            if (!value) return "Email is required";
            if (!value.includes("@")) return "Invalid email format";
            return null;
        },
    };

    const defaultProps = {
        sectionId: "test-section",
        title: "Test Section",
        data: mockData,
        onSave: vi.fn(),
        children: ({ isEditing, data, onFieldChange }) => (
            <div>
                {isEditing ? (
                    <div>
                        <input
                            data-testid="name-input"
                            value={data.name}
                            onChange={(e) =>
                                onFieldChange("name", e.target.value)
                            }
                        />
                        <input
                            data-testid="email-input"
                            value={data.email}
                            onChange={(e) =>
                                onFieldChange("email", e.target.value)
                            }
                        />
                    </div>
                ) : (
                    <div>
                        <span data-testid="name-display">{data.name}</span>
                        <span data-testid="email-display">{data.email}</span>
                    </div>
                )}
            </div>
        ),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendering", () => {
        it("renders with required props", () => {
            render(<EditableSection {...defaultProps} />);

            expect(screen.getByText("Test Section")).toBeInTheDocument();
            expect(screen.getByText("Edit")).toBeInTheDocument();
            expect(screen.getByTestId("name-display")).toHaveTextContent(
                "John Doe"
            );
            expect(screen.getByTestId("email-display")).toHaveTextContent(
                "john@example.com"
            );
        });

        it("displays section title and icon", () => {
            render(<EditableSection {...defaultProps} icon="👤" />);

            expect(screen.getByText("Test Section")).toBeInTheDocument();
            expect(screen.getByText("👤")).toBeInTheDocument();
        });

        it("shows status indicator", () => {
            render(<EditableSection {...defaultProps} />);

            expect(screen.getByText("Ready")).toBeInTheDocument();
        });

        it("applies custom className", () => {
            render(
                <EditableSection {...defaultProps} className="custom-class" />
            );

            const section = screen.getByTestId("editable-section-test-section");
            expect(section).toHaveClass("custom-class");
        });
    });

    describe("Edit Mode", () => {
        it("switches to edit mode when edit button is clicked", async () => {
            const user = userEvent.setup();
            render(<EditableSection {...defaultProps} />);

            const editButton = screen.getByText("Edit");
            await user.click(editButton);

            expect(screen.getByTestId("name-input")).toBeInTheDocument();
            expect(screen.getByTestId("email-input")).toBeInTheDocument();
            expect(screen.getByText("Save")).toBeInTheDocument();
            expect(screen.getByText("Cancel")).toBeInTheDocument();
            expect(screen.getByText("Editing")).toBeInTheDocument();
        });

        it("does not switch to edit mode when disabled", async () => {
            const user = userEvent.setup();
            render(<EditableSection {...defaultProps} disabled />);

            const editButton = screen.getByText("Edit");
            expect(editButton).toBeDisabled();

            await user.click(editButton);
            expect(screen.queryByTestId("name-input")).not.toBeInTheDocument();
        });

        it("populates form fields with current data in edit mode", async () => {
            const user = userEvent.setup();
            render(<EditableSection {...defaultProps} />);

            await user.click(screen.getByText("Edit"));

            expect(screen.getByTestId("name-input")).toHaveValue("John Doe");
            expect(screen.getByTestId("email-input")).toHaveValue(
                "john@example.com"
            );
        });
    });

    describe("Field Changes", () => {
        it("updates local data when field changes", async () => {
            const user = userEvent.setup();
            render(<EditableSection {...defaultProps} />);

            await user.click(screen.getByText("Edit"));

            const nameInput = screen.getByTestId("name-input");
            await user.clear(nameInput);
            await user.type(nameInput, "Jane Doe");

            expect(nameInput).toHaveValue("Jane Doe");
        });

        it("clears validation errors when field is corrected", async () => {
            const user = userEvent.setup();
            render(
                <EditableSection
                    {...defaultProps}
                    validationRules={mockValidationRules}
                />
            );

            await user.click(screen.getByText("Edit"));

            // Clear name field to trigger validation error
            const nameInput = screen.getByTestId("name-input");
            await user.clear(nameInput);

            // Try to save to trigger validation
            await user.click(screen.getByText("Save"));

            expect(screen.getByText("Name is required")).toBeInTheDocument();

            // Fix the error
            await user.type(nameInput, "Jane Doe");

            // Error should be cleared
            expect(
                screen.queryByText("Name is required")
            ).not.toBeInTheDocument();
        });
    });

    describe("Validation", () => {
        it("shows validation errors when save is attempted with invalid data", async () => {
            const user = userEvent.setup();
            render(
                <EditableSection
                    {...defaultProps}
                    validationRules={mockValidationRules}
                />
            );

            await user.click(screen.getByText("Edit"));

            // Clear required fields
            await user.clear(screen.getByTestId("name-input"));
            await user.clear(screen.getByTestId("email-input"));

            await user.click(screen.getByText("Save"));

            expect(
                screen.getByText("Please fix the following errors:")
            ).toBeInTheDocument();
            expect(screen.getByText("Name is required")).toBeInTheDocument();
            expect(screen.getByText("Email is required")).toBeInTheDocument();
        });

        it("disables save button when validation errors exist", async () => {
            const user = userEvent.setup();
            render(
                <EditableSection
                    {...defaultProps}
                    validationRules={mockValidationRules}
                />
            );

            await user.click(screen.getByText("Edit"));

            // Clear required field
            await user.clear(screen.getByTestId("name-input"));

            // Try to save to trigger validation
            await user.click(screen.getByText("Save"));

            const saveButton = screen.getByText("Save");
            expect(saveButton).toBeDisabled();
        });

        it("validates email format", async () => {
            const user = userEvent.setup();
            render(
                <EditableSection
                    {...defaultProps}
                    validationRules={mockValidationRules}
                />
            );

            await user.click(screen.getByText("Edit"));

            const emailInput = screen.getByTestId("email-input");
            await user.clear(emailInput);
            await user.type(emailInput, "invalid-email");

            await user.click(screen.getByText("Save"));

            expect(
                screen.getByText("Invalid email format")
            ).toBeInTheDocument();
        });
    });

    describe("Save Functionality", () => {
        it("calls onSave with updated data when save is clicked", async () => {
            const user = userEvent.setup();
            const mockOnSave = vi.fn().mockResolvedValue();

            render(<EditableSection {...defaultProps} onSave={mockOnSave} />);

            await user.click(screen.getByText("Edit"));

            const nameInput = screen.getByTestId("name-input");
            await user.clear(nameInput);
            await user.type(nameInput, "Jane Doe");

            await user.click(screen.getByText("Save"));

            await waitFor(() => {
                expect(mockOnSave).toHaveBeenCalledWith({
                    ...mockData,
                    name: "Jane Doe",
                });
            });
        });

        it("exits edit mode after successful save", async () => {
            const user = userEvent.setup();
            const mockOnSave = vi.fn().mockResolvedValue();

            render(<EditableSection {...defaultProps} onSave={mockOnSave} />);

            await user.click(screen.getByText("Edit"));
            await user.click(screen.getByText("Save"));

            await waitFor(() => {
                expect(screen.getByText("Edit")).toBeInTheDocument();
                expect(screen.queryByText("Save")).not.toBeInTheDocument();
            });
        });

        it("shows loading state during save", async () => {
            const user = userEvent.setup();
            const mockOnSave = vi
                .fn()
                .mockImplementation(
                    () => new Promise((resolve) => setTimeout(resolve, 100))
                );

            render(<EditableSection {...defaultProps} onSave={mockOnSave} />);

            await user.click(screen.getByText("Edit"));
            await user.click(screen.getByText("Save"));

            expect(screen.getByText("Saving...")).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
            });
        });

        it("handles save errors gracefully", async () => {
            const user = userEvent.setup();
            const mockOnSave = vi
                .fn()
                .mockRejectedValue(new Error("Save failed"));
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            render(<EditableSection {...defaultProps} onSave={mockOnSave} />);

            await user.click(screen.getByText("Edit"));
            await user.click(screen.getByText("Save"));

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    "Error saving data:",
                    expect.any(Error)
                );
            });

            consoleSpy.mockRestore();
        });
    });

    describe("Cancel Functionality", () => {
        it("reverts changes when cancel is clicked", async () => {
            const user = userEvent.setup();
            render(<EditableSection {...defaultProps} />);

            await user.click(screen.getByText("Edit"));

            const nameInput = screen.getByTestId("name-input");
            await user.clear(nameInput);
            await user.type(nameInput, "Jane Doe");

            await user.click(screen.getByText("Cancel"));

            // Should exit edit mode and revert to original data
            expect(screen.getByTestId("name-display")).toHaveTextContent(
                "John Doe"
            );
            expect(screen.getByText("Edit")).toBeInTheDocument();
        });

        it("calls onCancel callback when cancel is clicked", async () => {
            const user = userEvent.setup();
            const mockOnCancel = vi.fn();

            render(
                <EditableSection {...defaultProps} onCancel={mockOnCancel} />
            );

            await user.click(screen.getByText("Edit"));
            await user.click(screen.getByText("Cancel"));

            expect(mockOnCancel).toHaveBeenCalled();
        });

        it("clears validation errors when cancel is clicked", async () => {
            const user = userEvent.setup();
            render(
                <EditableSection
                    {...defaultProps}
                    validationRules={mockValidationRules}
                />
            );

            await user.click(screen.getByText("Edit"));

            // Create validation error
            await user.clear(screen.getByTestId("name-input"));
            await user.click(screen.getByText("Save"));

            expect(screen.getByText("Name is required")).toBeInTheDocument();

            // Cancel should clear errors
            await user.click(screen.getByText("Cancel"));
            await user.click(screen.getByText("Edit"));

            expect(
                screen.queryByText("Name is required")
            ).not.toBeInTheDocument();
        });
    });

    describe("Auto-save Functionality", () => {
        it("enables auto-save when autoSave prop is true", async () => {
            const user = userEvent.setup();
            const mockOnSave = vi.fn().mockResolvedValue();

            render(
                <EditableSection
                    {...defaultProps}
                    onSave={mockOnSave}
                    autoSave={true}
                    autoSaveDelay={100}
                />
            );

            await user.click(screen.getByText("Edit"));

            const nameInput = screen.getByTestId("name-input");
            await user.clear(nameInput);
            await user.type(nameInput, "Jane Doe");

            // Wait for auto-save delay
            await waitFor(
                () => {
                    expect(mockOnSave).toHaveBeenCalledWith({
                        ...mockData,
                        name: "Jane Doe",
                    });
                },
                { timeout: 200 }
            );
        });
    });

    describe("Accessibility", () => {
        it("provides proper ARIA labels for buttons", () => {
            render(<EditableSection {...defaultProps} />);

            const editButton = screen.getByLabelText("Edit Test Section");
            expect(editButton).toBeInTheDocument();
        });

        it("announces validation errors with role=alert", async () => {
            const user = userEvent.setup();
            render(
                <EditableSection
                    {...defaultProps}
                    validationRules={mockValidationRules}
                />
            );

            await user.click(screen.getByText("Edit"));
            await user.clear(screen.getByTestId("name-input"));
            await user.click(screen.getByText("Save"));

            const errorSummary = screen.getByRole("alert");
            expect(errorSummary).toBeInTheDocument();
            expect(errorSummary).toHaveTextContent(
                "Please fix the following errors:"
            );
        });

        it("supports keyboard navigation", async () => {
            const user = userEvent.setup();
            render(<EditableSection {...defaultProps} />);

            // Tab to edit button and activate with Enter
            await user.tab();
            expect(screen.getByText("Edit")).toHaveFocus();

            await user.keyboard("{Enter}");
            expect(screen.getByText("Save")).toBeInTheDocument();
        });
    });

    describe("Data Updates", () => {
        it("updates local data when prop data changes outside edit mode", () => {
            const { rerender } = render(<EditableSection {...defaultProps} />);

            expect(screen.getByTestId("name-display")).toHaveTextContent(
                "John Doe"
            );

            const newData = { ...mockData, name: "Jane Smith" };
            rerender(<EditableSection {...defaultProps} data={newData} />);

            expect(screen.getByTestId("name-display")).toHaveTextContent(
                "Jane Smith"
            );
        });

        it("does not update local data when prop data changes during edit mode", async () => {
            const user = userEvent.setup();
            const { rerender } = render(<EditableSection {...defaultProps} />);

            await user.click(screen.getByText("Edit"));

            const nameInput = screen.getByTestId("name-input");
            expect(nameInput).toHaveValue("John Doe");

            // Update prop data while in edit mode
            const newData = { ...mockData, name: "Jane Smith" };
            rerender(<EditableSection {...defaultProps} data={newData} />);

            // Local data should not change during editing
            expect(nameInput).toHaveValue("John Doe");
        });
    });

    describe("Form Submission", () => {
        it("handles form submission via onSubmit", async () => {
            const user = userEvent.setup();
            const mockOnSave = vi.fn().mockResolvedValue();

            // Create a form wrapper to test form submission
            const TestFormWrapper = () => (
                <EditableSection {...defaultProps} onSave={mockOnSave}>
                    {({ isEditing, data, onFieldChange, onSubmit }) => (
                        <form onSubmit={onSubmit} data-testid="test-form">
                            {isEditing ? (
                                <input
                                    data-testid="name-input"
                                    value={data.name}
                                    onChange={(e) =>
                                        onFieldChange("name", e.target.value)
                                    }
                                />
                            ) : (
                                <span data-testid="name-display">
                                    {data.name}
                                </span>
                            )}
                        </form>
                    )}
                </EditableSection>
            );

            render(<TestFormWrapper />);
            await user.click(screen.getByText("Edit"));

            await user.clear(screen.getByTestId("name-input"));
            await user.type(screen.getByTestId("name-input"), "Jane Doe");

            // Submit form by pressing Enter
            await user.keyboard("{Enter}");

            await waitFor(() => {
                expect(mockOnSave).toHaveBeenCalledWith({
                    ...mockData,
                    name: "Jane Doe",
                });
            });
        });
    });
});
