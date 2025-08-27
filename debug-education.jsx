import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Education from "./src/components/Education.jsx";
import { EDUCATION_FIELDS } from "./src/models/dataTypes.js";

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

// Debug test
const user = userEvent.setup();

render(<Education data={sampleEducationData} onUpdate={mockOnUpdate} />);

const editButton = screen.getByRole("button", { name: /edit education/i });
user.click(editButton);

console.log("School name inputs:", screen.getAllByLabelText(/school name/i));
