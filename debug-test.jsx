import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Education from "./src/components/Education.jsx";
import { EDUCATION_FIELDS } from "./src/models/dataTypes.js";

// Mock CSS modules
const mockStyles = {
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
};

// Mock the CSS modules
vi.mock("./src/styles/Education.module.css", () => ({ default: mockStyles }));
vi.mock("./src/styles/EditableSection.module.css", () => ({
    default: mockStyles,
}));
vi.mock("./src/styles/FormField.module.css", () => ({ default: mockStyles }));

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
        [EDUCATION_FIELDS.TITLE_OF_STUDY]: "Associate Degree in Mathematics",
        [EDUCATION_FIELDS.START_DATE]: "2016-09-01",
        [EDUCATION_FIELDS.END_DATE]: "2018-05-30",
    },
];

const mockOnUpdate = () => {};

async function debugTest() {
    const user = userEvent.setup();

    render(<Education data={sampleEducationData} onUpdate={mockOnUpdate} />);

    console.log("Initial render - looking for edit button");
    const editButton = screen.getByRole("button", { name: /edit education/i });
    console.log("Found edit button:", editButton);

    await user.click(editButton);

    console.log("After clicking edit button - looking for school name inputs");

    // Let's see what's actually rendered
    screen.debug();

    const schoolInputs = screen.getAllByLabelText(/school name/i);
    console.log("Found school inputs:", schoolInputs.length);

    return schoolInputs.length;
}

debugTest()
    .then((count) => {
        console.log("Final count:", count);
    })
    .catch((error) => {
        console.error("Error:", error);
    });
