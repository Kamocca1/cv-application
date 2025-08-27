import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CVPreview from "../components/CVPreview.jsx";
import {
    DEFAULT_CV_DATA,
    PERSONAL_INFO_FIELDS,
    EDUCATION_FIELDS,
    WORK_EXPERIENCE_FIELDS,
} from "../models/dataTypes.js";

describe("CVPreview", () => {
    it("renders empty state when no data is provided", () => {
        render(<CVPreview cvData={DEFAULT_CV_DATA} />);

        expect(
            screen.getByText(/Start filling out the form on the left/)
        ).toBeInTheDocument();
    });

    it("renders personal information when provided", () => {
        const testData = {
            ...DEFAULT_CV_DATA,
            personalInfo: {
                [PERSONAL_INFO_FIELDS.NAME]: "John Doe",
                [PERSONAL_INFO_FIELDS.EMAIL]: "john@example.com",
                [PERSONAL_INFO_FIELDS.PHONE]: "+1 (555) 123-4567",
            },
        };

        render(<CVPreview cvData={testData} />);

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText(/john@example\.com/)).toBeInTheDocument();
        expect(screen.getByText(/\+1 \(555\) 123-4567/)).toBeInTheDocument();
    });

    it("renders work experience when provided", () => {
        const testData = {
            ...DEFAULT_CV_DATA,
            personalInfo: {
                [PERSONAL_INFO_FIELDS.NAME]: "John Doe",
            },
            workExperience: [
                {
                    [WORK_EXPERIENCE_FIELDS.POSITION_TITLE]:
                        "Software Engineer",
                    [WORK_EXPERIENCE_FIELDS.COMPANY_NAME]: "Tech Corp",
                    [WORK_EXPERIENCE_FIELDS.START_DATE]: "2020-01",
                    [WORK_EXPERIENCE_FIELDS.END_DATE]: "2023-12",
                    [WORK_EXPERIENCE_FIELDS.IS_CURRENT]: false,
                    [WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES]:
                        "Developed web applications",
                },
            ],
        };

        render(<CVPreview cvData={testData} />);

        expect(screen.getByText("Work Experience")).toBeInTheDocument();
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
        expect(screen.getByText("Tech Corp")).toBeInTheDocument();
        expect(
            screen.getByText("Developed web applications")
        ).toBeInTheDocument();
    });

    it("renders education when provided", () => {
        const testData = {
            ...DEFAULT_CV_DATA,
            personalInfo: {
                [PERSONAL_INFO_FIELDS.NAME]: "John Doe",
            },
            education: [
                {
                    [EDUCATION_FIELDS.TITLE_OF_STUDY]: "Computer Science",
                    [EDUCATION_FIELDS.SCHOOL_NAME]: "University of Tech",
                    [EDUCATION_FIELDS.START_DATE]: "2016-09",
                    [EDUCATION_FIELDS.END_DATE]: "2020-05",
                },
            ],
        };

        render(<CVPreview cvData={testData} />);

        expect(screen.getByText("Education")).toBeInTheDocument();
        expect(screen.getByText("Computer Science")).toBeInTheDocument();
        expect(screen.getByText("University of Tech")).toBeInTheDocument();
    });
});
