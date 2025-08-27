import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EDUCATION_FIELDS } from "../models/dataTypes.js";

// Simple test component to debug the issue
const SimpleEducation = ({ data = [] }) => {
    const [isEditing, setIsEditing] = React.useState(false);

    const renderEditForm = () => {
        console.log("Rendering edit form with data:", data);
        return (
            <div>
                {data.map((entry, index) => (
                    <div key={entry[EDUCATION_FIELDS.ID]}>
                        <label htmlFor={`school-${index}`}>School Name</label>
                        <input
                            id={`school-${index}`}
                            value={entry[EDUCATION_FIELDS.SCHOOL_NAME]}
                            readOnly
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            {!isEditing ? (
                <button onClick={() => setIsEditing(true)}>
                    Edit Education
                </button>
            ) : (
                renderEditForm()
            )}
        </div>
    );
};

describe("Simple Education Debug", () => {
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

    it("should render multiple entries", async () => {
        const user = userEvent.setup();

        render(<SimpleEducation data={sampleEducationData} />);

        const editButton = screen.getByRole("button", {
            name: /edit education/i,
        });
        await user.click(editButton);

        const schoolInputs = screen.getAllByLabelText(/school name/i);
        expect(schoolInputs).toHaveLength(2);
    });
});
