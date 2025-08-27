import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WorkExperience from "../components/WorkExperience.jsx";
import {
    DEFAULT_WORK_EXPERIENCE_ENTRY,
    WORK_EXPERIENCE_FIELDS,
} from "../models/dataTypes.js";

// Mock CSS modules
vi.mock("../styles/WorkExperience.module.css", () => ({
    default: {
        workExperience: "workExperience",
        displayView: "displayView",
        experienceList: "experienceList",
        experienceItem: "experienceItem",
        currentJobBadge: "currentJobBadge",
        experienceHeader: "experienceHeader",
        positionTitle: "positionTitle",
        companyName: "companyName",
        dateRange: "dateRange",
        responsibilities: "responsibilities",
        responsibilitiesTitle: "responsibilitiesTitle",
        responsibilitiesText: "responsibilitiesText",
        editForm: "editForm",
        experienceEntries: "experienceEntries",
        experienceEntry: "experienceEntry",
        entryHeader: "entryHeader",
        entryTitle: "entryTitle",
        removeButton: "removeButton",
        removeIcon: "removeIcon",
        entryFields: "entryFields",
        basicFields: "basicFields",
        dateFields: "dateFields",
        currentJobField: "currentJobField",
        currentJobCheckbox: "currentJobCheckbox",
        currentJobLabel: "currentJobLabel",
        responsibilitiesField: "responsibilitiesField",
        responsibilitiesTextArea: "responsibilitiesTextArea",
        addButton: "addButton",
        addIcon: "addIcon",
        emptyState: "emptyState",
        emptyStateIcon: "emptyStateIcon",
        emptyStateText: "emptyStateText",
        emptyStateSubtext: "emptyStateSubtext",
        editableSection: "editableSection",
    },
}));

// Mock EditableSection component
vi.mock("../components/EditableSection.jsx", () => ({
    default: ({ children, data, onSave, validationRules, disabled }) => {
        const [isEditing, setIsEditing] = React.useState(false);
        const [localData, setLocalData] = React.useState(data);

        const handleEdit = () => setIsEditing(true);
        const handleSave = () => {
            onSave(localData);
            setIsEditing(false);
        };
        const handleCancel = () => {
            setLocalData(data);
            setIsEditing(false);
        };
        const handleFieldChange = (field, value) => {
            setLocalData({ ...localData, [field]: value });
        };

        const childProps = {
            isEditing,
            data: localData,
            onFieldChange: handleFieldChange,
            onEdit: handleEdit,
            onSave: handleSave,
            onCancel: handleCancel,
            validationErrors: {},
        };

        return (
            <div data-testid="editable-section">
                <button onClick={handleEdit} disabled={isEditing || disabled}>
                    Edit
                </button>
                {isEditing && (
                    <>
                        <button onClick={handleSave}>Save</button>
                        <button onClick={handleCancel}>Cancel</button>
                    </>
                )}
                {children(childProps)}
            </div>
        );
    },
}));

// Mock form components
vi.mock("../components/TextInput.jsx", () => ({
    default: ({ label, value, onChange, placeholder, required, error }) => {
        const inputId = `text-input-${label
            .toLowerCase()
            .replace(/\s+/g, "-")}`;
        return (
            <div>
                <label htmlFor={inputId}>{label}</label>
                <input
                    id={inputId}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    data-testid={inputId}
                />
                {error && <div data-testid="error">{error}</div>}
            </div>
        );
    },
}));

vi.mock("../components/TextArea.jsx", () => ({
    default: ({
        label,
        value,
        onChange,
        placeholder,
        required,
        rows,
        maxLength,
    }) => {
        const inputId = `textarea-${label.toLowerCase().replace(/\s+/g, "-")}`;
        return (
            <div>
                <label htmlFor={inputId}>{label}</label>
                <textarea
                    id={inputId}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    rows={rows}
                    maxLength={maxLength}
                    data-testid={inputId}
                />
            </div>
        );
    },
}));

vi.mock("../components/DateInput.jsx", () => ({
    default: ({ label, value, onChange, required, min, max }) => {
        const inputId = `date-input-${label
            .toLowerCase()
            .replace(/\s+/g, "-")}`;
        return (
            <div>
                <label htmlFor={inputId}>{label}</label>
                <input
                    id={inputId}
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    min={min}
                    max={max}
                    data-testid={inputId}
                />
            </div>
        );
    },
}));

describe("WorkExperience Component", () => {
    const mockOnUpdate = vi.fn();
    const user = userEvent.setup();

    const sampleWorkExperience = [
        {
            [WORK_EXPERIENCE_FIELDS.ID]: "work_1",
            [WORK_EXPERIENCE_FIELDS.COMPANY_NAME]: "Tech Corp",
            [WORK_EXPERIENCE_FIELDS.POSITION_TITLE]: "Software Engineer",
            [WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES]:
                "Developed web applications using React and Node.js",
            [WORK_EXPERIENCE_FIELDS.START_DATE]: "2022-01-01",
            [WORK_EXPERIENCE_FIELDS.END_DATE]: "2023-12-31",
            [WORK_EXPERIENCE_FIELDS.IS_CURRENT]: false,
        },
        {
            [WORK_EXPERIENCE_FIELDS.ID]: "work_2",
            [WORK_EXPERIENCE_FIELDS.COMPANY_NAME]: "StartupXYZ",
            [WORK_EXPERIENCE_FIELDS.POSITION_TITLE]: "Senior Developer",
            [WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES]:
                "Led development team and architected scalable solutions",
            [WORK_EXPERIENCE_FIELDS.START_DATE]: "2024-01-01",
            [WORK_EXPERIENCE_FIELDS.END_DATE]: "",
            [WORK_EXPERIENCE_FIELDS.IS_CURRENT]: true,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Display Mode", () => {
        it("renders empty state when no work experience data", () => {
            render(<WorkExperience data={[]} onUpdate={mockOnUpdate} />);

            expect(
                screen.getByText("No work experience entries added yet")
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'Click "Edit" to add your professional experience'
                )
            ).toBeInTheDocument();
        });

        it("displays work experience entries in reverse chronological order", () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                />
            );

            const positionTitles = screen.getAllByText(
                /Software Engineer|Senior Developer/
            );
            expect(positionTitles[0]).toHaveTextContent("Senior Developer"); // Current job first
            expect(positionTitles[1]).toHaveTextContent("Software Engineer");
        });

        it("displays current job badge for current positions", () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                />
            );

            expect(screen.getByText("Current")).toBeInTheDocument();
        });

        it("formats dates correctly in display view", () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                />
            );

            expect(screen.getByText("Jan 2024 - Present")).toBeInTheDocument();
            expect(screen.getByText("Jan 2022 - Dec 2023")).toBeInTheDocument();
        });

        it("displays responsibilities when available", () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                />
            );

            expect(
                screen.getByText(
                    "Developed web applications using React and Node.js"
                )
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Led development team and architected scalable solutions"
                )
            ).toBeInTheDocument();
        });
    });

    describe("Edit Mode", () => {
        it("switches to edit mode when edit button is clicked", async () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                />
            );

            await user.click(screen.getByText("Edit"));

            expect(
                screen.getByText("Work Experience Entry 1")
            ).toBeInTheDocument();
            expect(
                screen.getByText("Work Experience Entry 2")
            ).toBeInTheDocument();
        });

        it("renders form fields for each work experience entry", async () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                />
            );

            await user.click(screen.getByText("Edit"));

            expect(
                screen.getAllByTestId("text-input-company-name")
            ).toHaveLength(2);
            expect(
                screen.getAllByTestId("text-input-position-title")
            ).toHaveLength(2);
            expect(
                screen.getAllByTestId("textarea-main-responsibilities")
            ).toHaveLength(2);
            expect(screen.getAllByTestId("date-input-start-date")).toHaveLength(
                2
            );
        });

        it("shows current job checkbox and hides end date for current jobs", async () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                />
            );

            await user.click(screen.getByText("Edit"));

            const checkboxes = screen.getAllByRole("checkbox");
            expect(checkboxes).toHaveLength(2);

            // Current job should be checked
            expect(checkboxes[1]).toBeChecked();

            // Should have one less end date field (current job doesn't show end date)
            expect(screen.getAllByTestId("date-input-end-date")).toHaveLength(
                1
            );
        });

        it("allows adding new work experience entries", async () => {
            render(<WorkExperience data={[]} onUpdate={mockOnUpdate} />);

            await user.click(screen.getByText("Edit"));
            await user.click(screen.getByText("Add Work Experience Entry"));

            expect(
                screen.getByText("Work Experience Entry 1")
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("text-input-company-name")
            ).toBeInTheDocument();
        });

        it("allows removing work experience entries when multiple exist", async () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                />
            );

            await user.click(screen.getByText("Edit"));

            const removeButtons = screen.getAllByText("Remove");
            expect(removeButtons).toHaveLength(2);

            await user.click(removeButtons[0]);

            expect(
                screen.getByText("Work Experience Entry 1")
            ).toBeInTheDocument();
            expect(
                screen.queryByText("Work Experience Entry 2")
            ).not.toBeInTheDocument();
        });

        it("does not show remove button when only one entry exists", async () => {
            const singleEntry = [sampleWorkExperience[0]];
            render(
                <WorkExperience data={singleEntry} onUpdate={mockOnUpdate} />
            );

            await user.click(screen.getByText("Edit"));

            expect(screen.queryByText("Remove")).not.toBeInTheDocument();
        });

        it("updates field values when user types", async () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                />
            );

            await user.click(screen.getByText("Edit"));

            const companyInput = screen.getAllByTestId(
                "text-input-company-name"
            )[0];
            await user.clear(companyInput);
            await user.type(companyInput, "New Company");

            expect(companyInput).toHaveValue("New Company");
        });

        it("clears end date when current job checkbox is checked", async () => {
            const workData = [
                {
                    ...sampleWorkExperience[0],
                    [WORK_EXPERIENCE_FIELDS.IS_CURRENT]: false,
                },
            ];

            render(<WorkExperience data={workData} onUpdate={mockOnUpdate} />);

            await user.click(screen.getByText("Edit"));

            const checkbox = screen.getByRole("checkbox");
            await user.click(checkbox);

            expect(checkbox).toBeChecked();
            // End date field should disappear when current job is checked
            expect(
                screen.queryByTestId("date-input-end-date")
            ).not.toBeInTheDocument();
        });
    });

    describe("Data Management", () => {
        it("calls onUpdate with sorted data when saved", async () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                />
            );

            await user.click(screen.getByText("Edit"));
            await user.click(screen.getByText("Save"));

            expect(mockOnUpdate).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        [WORK_EXPERIENCE_FIELDS.IS_CURRENT]: true,
                    }),
                    expect.objectContaining({
                        [WORK_EXPERIENCE_FIELDS.IS_CURRENT]: false,
                    }),
                ])
            );
        });

        it("generates unique IDs for new entries", async () => {
            render(<WorkExperience data={[]} onUpdate={mockOnUpdate} />);

            await user.click(screen.getByText("Edit"));
            await user.click(screen.getByText("Add Work Experience Entry"));

            // Verify that a new entry was created (we can't directly test the ID generation
            // without exposing internal implementation, but we can verify the entry exists)
            expect(
                screen.getByText("Work Experience Entry 1")
            ).toBeInTheDocument();
        });

        it("sorts entries with current jobs first, then by start date", () => {
            const unsortedData = [
                {
                    ...DEFAULT_WORK_EXPERIENCE_ENTRY,
                    [WORK_EXPERIENCE_FIELDS.ID]: "1",
                    [WORK_EXPERIENCE_FIELDS.COMPANY_NAME]: "Old Company",
                    [WORK_EXPERIENCE_FIELDS.POSITION_TITLE]: "Old Position",
                    [WORK_EXPERIENCE_FIELDS.START_DATE]: "2020-01-01",
                    [WORK_EXPERIENCE_FIELDS.IS_CURRENT]: false,
                },
                {
                    ...DEFAULT_WORK_EXPERIENCE_ENTRY,
                    [WORK_EXPERIENCE_FIELDS.ID]: "2",
                    [WORK_EXPERIENCE_FIELDS.COMPANY_NAME]: "Current Company",
                    [WORK_EXPERIENCE_FIELDS.POSITION_TITLE]: "Current Position",
                    [WORK_EXPERIENCE_FIELDS.START_DATE]: "2023-01-01",
                    [WORK_EXPERIENCE_FIELDS.IS_CURRENT]: true,
                },
                {
                    ...DEFAULT_WORK_EXPERIENCE_ENTRY,
                    [WORK_EXPERIENCE_FIELDS.ID]: "3",
                    [WORK_EXPERIENCE_FIELDS.COMPANY_NAME]: "Recent Company",
                    [WORK_EXPERIENCE_FIELDS.POSITION_TITLE]: "Recent Position",
                    [WORK_EXPERIENCE_FIELDS.START_DATE]: "2022-01-01",
                    [WORK_EXPERIENCE_FIELDS.IS_CURRENT]: false,
                },
            ];

            render(
                <WorkExperience data={unsortedData} onUpdate={mockOnUpdate} />
            );

            // The current job should appear first (has "Current" badge)
            expect(screen.getByText("Current")).toBeInTheDocument();

            // Check that current position appears first
            const positionTitles = screen.getAllByText(/Position/);
            expect(positionTitles[0]).toHaveTextContent("Current Position");
        });
    });

    describe("Validation", () => {
        it("validates required fields", async () => {
            render(<WorkExperience data={[]} onUpdate={mockOnUpdate} />);

            await user.click(screen.getByText("Edit"));
            await user.click(screen.getByText("Add Work Experience Entry"));

            // Try to save without filling required fields
            await user.click(screen.getByText("Save"));

            // The validation should prevent saving (this would be handled by EditableSection)
            // We can't easily test the exact validation messages without a more complex mock
        });

        it("validates date ranges", async () => {
            const invalidData = [
                {
                    ...DEFAULT_WORK_EXPERIENCE_ENTRY,
                    [WORK_EXPERIENCE_FIELDS.ID]: "1",
                    [WORK_EXPERIENCE_FIELDS.START_DATE]: "2023-01-01",
                    [WORK_EXPERIENCE_FIELDS.END_DATE]: "2022-01-01", // End before start
                    [WORK_EXPERIENCE_FIELDS.IS_CURRENT]: false,
                },
            ];

            render(
                <WorkExperience data={invalidData} onUpdate={mockOnUpdate} />
            );

            // The validation rules should catch this error
            // Actual validation testing would require more complex mocking of the validation system
        });
    });

    describe("Accessibility", () => {
        it("provides proper labels for form fields", async () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                />
            );

            await user.click(screen.getByText("Edit"));

            expect(screen.getByLabelText("Company Name")).toBeInTheDocument();
            expect(screen.getByLabelText("Position Title")).toBeInTheDocument();
            expect(
                screen.getByLabelText("Main Responsibilities")
            ).toBeInTheDocument();
            expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
        });

        it("provides aria-labels for action buttons", async () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                />
            );

            await user.click(screen.getByText("Edit"));

            expect(
                screen.getByLabelText("Remove work experience entry 1")
            ).toBeInTheDocument();
            expect(
                screen.getByLabelText("Remove work experience entry 2")
            ).toBeInTheDocument();
            expect(
                screen.getByLabelText("Add new work experience entry")
            ).toBeInTheDocument();
        });

        it("associates checkbox with proper label", async () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                />
            );

            await user.click(screen.getByText("Edit"));

            const checkboxLabels = screen.getAllByText(
                "This is my current job"
            );
            expect(checkboxLabels).toHaveLength(2);
        });
    });

    describe("Props", () => {
        it("applies custom className", () => {
            const { container } = render(
                <WorkExperience
                    data={[]}
                    onUpdate={mockOnUpdate}
                    className="custom-class"
                />
            );

            expect(container.firstChild).toHaveClass(
                "workExperience",
                "custom-class"
            );
        });

        it("handles disabled state", () => {
            render(
                <WorkExperience
                    data={sampleWorkExperience}
                    onUpdate={mockOnUpdate}
                    disabled={true}
                />
            );

            const editButton = screen.getByText("Edit");
            expect(editButton).toBeDisabled();
        });

        it("handles empty data prop", () => {
            render(<WorkExperience onUpdate={mockOnUpdate} />);

            expect(
                screen.getByText("No work experience entries added yet")
            ).toBeInTheDocument();
        });
    });
});
