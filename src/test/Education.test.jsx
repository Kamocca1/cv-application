import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Education from "../components/Education.jsx";
import { EDUCATION_FIELDS } from "../models/dataTypes.js";

// Mock CSS modules
vi.mock("../styles/Education.module.css", () => ({
    default: {
        education: "education",
        editableSection: "editableSection",
        editForm: "editForm",
        educationEntries: "educationEntries",
        educationEntry: "educationEntry",
        entryHeader: "entryHeader",
        entryTitle: "entryTitle",
        removeButton: "removeButton",
        removeIcon: "removeIcon",
        entryFields: "entryFields",
        dateFields: "dateFields",
        schoolField: "schoolField",
        titleField: "titleField",
        startDateField: "startDateField",
        endDateField: "endDateField",
        addButton: "addButton",
        addIcon: "addIcon",
        displayView: "displayView",
        educationList: "educationList",
        educationItem: "educationItem",
        educationHeader: "educationHeader",
        schoolName: "schoolName",
        dateRange: "dateRange",
        titleOfStudy: "titleOfStudy",
        emptyState: "emptyState",
        emptyStateIcon: "emptyStateIcon",
        emptyStateText: "emptyStateText",
        emptyStateSubtext: "emptyStateSubtext",
    },
}));

vi.mock("../styles/EditableSection.module.css", () => ({
    default: {
        editableSection: "editableSection",
        sectionWrapper: "sectionWrapper",
        displayMode: "displayMode",
        editingMode: "editingMode",
        sectionHeader: "sectionHeader",
        sectionTitle: "sectionTitle",
        sectionIcon: "sectionIcon",
        sectionActions: "sectionActions",
        statusIndicator: "statusIndicator",
        statusDot: "statusDot",
        actionButton: "actionButton",
        editButton: "editButton",
        cancelButton: "cancelButton",
        submitButton: "submitButton",
        buttonIcon: "buttonIcon",
        sectionContent: "sectionContent",
        contentWrapper: "contentWrapper",
    },
}));

vi.mock("../styles/FormField.module.css", () => ({
    default: {
        fieldContainer: "fieldContainer",
        label: "label",
        required: "required",
        requiredIndicator: "requiredIndicator",
        input: "input",
        dateInput: "dateInput",
        inputError: "inputError",
        errorMessage: "errorMessage",
    },
}));

describe("Education Component", () => {
    const mockOnUpdate = vi.fn();
    const user = userEvent.setup();

    const sampleEducationData = [
        {
            [EDUCATION_FIELDS.ID]: "edu1",
            [EDUCATION_FIELDS.SCHOOL_NAME]: "University of Technology",
            [EDUCATION_FIELDS.TITLE_OF_STUDY]:
                "Bachelor of Science in Computer Science",
            [EDUCATION_FIELDS.START_DATE]: "2018-09-01",
            [EDUCATION_FIELDS.END_DATE]: "2022-06-15",
        },
        {
            [EDUCATION_FIELDS.ID]: "edu2",
            [EDUCATION_FIELDS.SCHOOL_NAME]: "Community College",
            [EDUCATION_FIELDS.TITLE_OF_STUDY]:
                "Associate Degree in Mathematics",
            [EDUCATION_FIELDS.START_DATE]: "2016-09-01",
            [EDUCATION_FIELDS.END_DATE]: "2018-05-30",
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Display Mode", () => {
        it("renders education entries in display mode", () => {
            render(
                <Education data={sampleEducationData} onUpdate={mockOnUpdate} />
            );

            expect(screen.getByText("Education")).toBeInTheDocument();
            expect(
                screen.getByText("University of Technology")
            ).toBeInTheDocument();
            expect(
                screen.getByText("Bachelor of Science in Computer Science")
            ).toBeInTheDocument();
            expect(screen.getByText("Community College")).toBeInTheDocument();
            expect(
                screen.getByText("Associate Degree in Mathematics")
            ).toBeInTheDocument();
        });

        it("displays education entries in chronological order (most recent first)", () => {
            render(
                <Education data={sampleEducationData} onUpdate={mockOnUpdate} />
            );

            const educationItems = screen.getAllByText(
                /University of Technology|Community College/
            );
            expect(educationItems[0]).toHaveTextContent(
                "University of Technology"
            );
            expect(educationItems[1]).toHaveTextContent("Community College");
        });

        it("formats dates correctly in display mode", () => {
            render(
                <Education data={sampleEducationData} onUpdate={mockOnUpdate} />
            );

            expect(screen.getByText("Sep 2018 - Jun 2022")).toBeInTheDocument();
            expect(screen.getByText("Sep 2016 - May 2018")).toBeInTheDocument();
        });

        it("shows empty state when no education data is provided", () => {
            render(<Education data={[]} onUpdate={mockOnUpdate} />);

            expect(
                screen.getByText("No education entries added yet")
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'Click "Edit" to add your educational background'
                )
            ).toBeInTheDocument();
        });

        it("shows edit button in display mode", () => {
            render(
                <Education data={sampleEducationData} onUpdate={mockOnUpdate} />
            );

            expect(
                screen.getByRole("button", { name: /edit education/i })
            ).toBeInTheDocument();
        });
    });

    describe("Edit Mode", () => {
        it("switches to edit mode when edit button is clicked", async () => {
            render(
                <Education data={sampleEducationData} onUpdate={mockOnUpdate} />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            expect(screen.getByText("Education Entry 1")).toBeInTheDocument();
            expect(screen.getByText("Education Entry 2")).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /save education/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", {
                    name: /cancel editing education/i,
                })
            ).toBeInTheDocument();
        });

        it("displays form fields for each education entry", async () => {
            render(
                <Education data={sampleEducationData} onUpdate={mockOnUpdate} />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            expect(screen.getAllByLabelText(/school name/i)).toHaveLength(2);
            expect(screen.getAllByLabelText(/title of study/i)).toHaveLength(2);
            expect(screen.getAllByLabelText(/start date/i)).toHaveLength(2);
            expect(screen.getAllByLabelText(/end date/i)).toHaveLength(2);
        });

        it("populates form fields with existing data", async () => {
            render(
                <Education data={sampleEducationData} onUpdate={mockOnUpdate} />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            const schoolNameInputs = screen.getAllByLabelText(/school name/i);
            expect(schoolNameInputs[0]).toHaveValue("University of Technology");
            expect(schoolNameInputs[1]).toHaveValue("Community College");

            const titleInputs = screen.getAllByLabelText(/title of study/i);
            expect(titleInputs[0]).toHaveValue(
                "Bachelor of Science in Computer Science"
            );
            expect(titleInputs[1]).toHaveValue(
                "Associate Degree in Mathematics"
            );
        });

        it("allows adding new education entries", async () => {
            render(
                <Education
                    data={[sampleEducationData[0]]}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            const addButton = screen.getByRole("button", {
                name: /add new education entry/i,
            });
            await user.click(addButton);

            expect(screen.getByText("Education Entry 1")).toBeInTheDocument();
            expect(screen.getByText("Education Entry 2")).toBeInTheDocument();
        });

        it("allows removing education entries when multiple entries exist", async () => {
            render(
                <Education data={sampleEducationData} onUpdate={mockOnUpdate} />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            const removeButtons = screen.getAllByRole("button", {
                name: /remove education entry/i,
            });
            expect(removeButtons).toHaveLength(2);

            await user.click(removeButtons[0]);

            expect(
                screen.queryByText("Education Entry 2")
            ).not.toBeInTheDocument();
            expect(screen.getByText("Education Entry 1")).toBeInTheDocument();
        });

        it("does not show remove button when only one entry exists", async () => {
            render(
                <Education
                    data={[sampleEducationData[0]]}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            expect(
                screen.queryByRole("button", {
                    name: /remove education entry/i,
                })
            ).not.toBeInTheDocument();
        });

        it("updates field values when user types", async () => {
            render(
                <Education
                    data={[sampleEducationData[0]]}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            const schoolNameInput = screen.getByLabelText(/school name/i);
            await user.clear(schoolNameInput);
            await user.type(schoolNameInput, "New University");

            expect(schoolNameInput).toHaveValue("New University");
        });
    });

    describe("Form Validation", () => {
        it("shows validation error when school name is empty", async () => {
            render(
                <Education
                    data={[sampleEducationData[0]]}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            const schoolNameInput = screen.getByLabelText(/school name/i);
            await user.clear(schoolNameInput);

            const saveButton = screen.getByRole("button", {
                name: /save education/i,
            });
            await user.click(saveButton);

            await waitFor(() => {
                expect(
                    screen.getByText(/entry 1.*school name is required/i)
                ).toBeInTheDocument();
            });
        });

        it("shows validation error when title of study is empty", async () => {
            render(
                <Education
                    data={[sampleEducationData[0]]}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            const titleInput = screen.getByLabelText(/title of study/i);
            await user.clear(titleInput);

            const saveButton = screen.getByRole("button", {
                name: /save education/i,
            });
            await user.click(saveButton);

            await waitFor(() => {
                expect(
                    screen.getByText(/entry 1.*title of study is required/i)
                ).toBeInTheDocument();
            });
        });

        it("shows validation error when start date is after end date", async () => {
            render(
                <Education
                    data={[sampleEducationData[0]]}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            const startDateInput = screen.getByLabelText(/start date/i);
            const endDateInput = screen.getByLabelText(/end date/i);

            await user.clear(startDateInput);
            await user.type(startDateInput, "2023-01-01");
            await user.clear(endDateInput);
            await user.type(endDateInput, "2022-01-01");

            const saveButton = screen.getByRole("button", {
                name: /save education/i,
            });
            await user.click(saveButton);

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /entry 1.*start date must be before end date/i
                    )
                ).toBeInTheDocument();
            });
        });

        it("disables save button when validation errors exist", async () => {
            render(
                <Education
                    data={[sampleEducationData[0]]}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            const schoolNameInput = screen.getByLabelText(/school name/i);
            await user.clear(schoolNameInput);

            const saveButton = screen.getByRole("button", {
                name: /save education/i,
            });
            await user.click(saveButton);

            await waitFor(() => {
                expect(saveButton).toBeDisabled();
            });
        });
    });

    describe("Save and Cancel", () => {
        it("calls onUpdate with sorted data when save is successful", async () => {
            render(
                <Education data={sampleEducationData} onUpdate={mockOnUpdate} />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            const schoolNameInput = screen.getAllByLabelText(/school name/i)[0];
            await user.clear(schoolNameInput);
            await user.type(schoolNameInput, "Updated University");

            const saveButton = screen.getByRole("button", {
                name: /save education/i,
            });
            await user.click(saveButton);

            await waitFor(() => {
                expect(mockOnUpdate).toHaveBeenCalledWith(
                    expect.arrayContaining([
                        expect.objectContaining({
                            [EDUCATION_FIELDS.SCHOOL_NAME]:
                                "Updated University",
                        }),
                        expect.objectContaining({
                            [EDUCATION_FIELDS.SCHOOL_NAME]: "Community College",
                        }),
                    ])
                );
            });
        });

        it("returns to display mode after successful save", async () => {
            render(
                <Education data={sampleEducationData} onUpdate={mockOnUpdate} />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            const saveButton = screen.getByRole("button", {
                name: /save education/i,
            });
            await user.click(saveButton);

            await waitFor(() => {
                expect(
                    screen.getByRole("button", { name: /edit education/i })
                ).toBeInTheDocument();
                expect(
                    screen.queryByRole("button", { name: /save education/i })
                ).not.toBeInTheDocument();
            });
        });

        it("reverts changes when cancel is clicked", async () => {
            render(
                <Education data={sampleEducationData} onUpdate={mockOnUpdate} />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            const schoolNameInput = screen.getAllByLabelText(/school name/i)[0];
            await user.clear(schoolNameInput);
            await user.type(schoolNameInput, "Changed University");

            const cancelButton = screen.getByRole("button", {
                name: /cancel editing education/i,
            });
            await user.click(cancelButton);

            // Should return to display mode with original data
            expect(
                screen.getByText("University of Technology")
            ).toBeInTheDocument();
            expect(
                screen.queryByText("Changed University")
            ).not.toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("has proper ARIA labels for buttons", async () => {
            render(
                <Education data={sampleEducationData} onUpdate={mockOnUpdate} />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            expect(
                screen.getByRole("button", { name: /add new education entry/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: /save education/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", {
                    name: /cancel editing education/i,
                })
            ).toBeInTheDocument();
        });

        it("associates form labels with inputs correctly", async () => {
            render(
                <Education
                    data={[sampleEducationData[0]]}
                    onUpdate={mockOnUpdate}
                />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            await user.click(editButton);

            const schoolNameInput = screen.getByLabelText(/school name/i);
            const titleInput = screen.getByLabelText(/title of study/i);
            const startDateInput = screen.getByLabelText(/start date/i);
            const endDateInput = screen.getByLabelText(/end date/i);

            expect(schoolNameInput).toBeInTheDocument();
            expect(titleInput).toBeInTheDocument();
            expect(startDateInput).toBeInTheDocument();
            expect(endDateInput).toBeInTheDocument();
        });
    });

    describe("Props", () => {
        it("applies custom className", () => {
            const { container } = render(
                <Education
                    data={[]}
                    onUpdate={mockOnUpdate}
                    className="custom-class"
                />
            );

            expect(container.firstChild).toHaveClass(
                "education",
                "custom-class"
            );
        });

        it("disables component when disabled prop is true", () => {
            render(
                <Education
                    data={sampleEducationData}
                    onUpdate={mockOnUpdate}
                    disabled={true}
                />
            );

            const editButton = screen.getByRole("button", {
                name: /edit education/i,
            });
            expect(editButton).toBeDisabled();
        });

        it("handles empty data array", () => {
            render(<Education data={[]} onUpdate={mockOnUpdate} />);

            expect(
                screen.getByText("No education entries added yet")
            ).toBeInTheDocument();
        });

        it("handles undefined data prop", () => {
            render(<Education onUpdate={mockOnUpdate} />);

            expect(
                screen.getByText("No education entries added yet")
            ).toBeInTheDocument();
        });
    });
});
