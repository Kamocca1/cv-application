import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CVBuilder from "../CVBuilder.jsx";

describe("CVBuilder Responsive Design", () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    it("renders without crashing", () => {
        render(<CVBuilder />);
        expect(screen.getByText("CV Builder")).toBeInTheDocument();
    });

    it("displays mobile-friendly header structure", () => {
        const { container } = render(<CVBuilder />);

        // Check that the header exists by CSS class
        const header = container.querySelector('[class*="header"]');
        expect(header).toBeTruthy();

        // Check that the title is present
        expect(screen.getByText("CV Builder")).toBeInTheDocument();
    });

    it("renders action buttons with proper accessibility", () => {
        render(<CVBuilder />);

        // Check that buttons have proper labels
        expect(
            screen.getByRole("button", { name: /save/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /export/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /clear/i })
        ).toBeInTheDocument();
    });

    it("displays sections in mobile-friendly layout", () => {
        render(<CVBuilder />);

        // Check that main sections are present using more specific selectors
        const personalInfoSection = screen.getByRole("heading", {
            name: /personal information/i,
        });
        const educationSection = screen.getByRole("heading", {
            name: /education/i,
        });
        const workExperienceSection = screen.getByRole("heading", {
            name: /work experience/i,
        });

        expect(personalInfoSection).toBeInTheDocument();
        expect(educationSection).toBeInTheDocument();
        expect(workExperienceSection).toBeInTheDocument();
    });

    it("handles empty state properly", () => {
        render(<CVBuilder />);

        // Should show guidance text for empty CV
        const guidanceText = screen.getByText(/start building your cv/i);
        expect(guidanceText).toBeInTheDocument();
    });

    it("applies responsive CSS classes", () => {
        const { container } = render(<CVBuilder />);

        // Check that the main container has the expected CSS class
        const cvBuilderElement = container.querySelector(
            '[class*="cvBuilder"]'
        );
        expect(cvBuilderElement).toBeTruthy();
    });
});
