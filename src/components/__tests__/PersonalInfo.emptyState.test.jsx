import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PersonalInfo from "../PersonalInfo.jsx";

describe("PersonalInfo Empty State Icon", () => {
    it("displays icon in empty state like other sections", () => {
        const mockOnUpdate = () => {};

        render(<PersonalInfo data={{}} onUpdate={mockOnUpdate} />);

        // Check that the empty state container exists
        const emptyState = document.querySelector('[class*="emptyState"]');
        expect(emptyState).toBeTruthy();

        // Check that the icon is present in the empty state
        const emptyStateIcon = document.querySelector(
            '[class*="emptyStateIcon"]'
        );
        expect(emptyStateIcon).toBeTruthy();

        // Check that the icon contains the person emoji
        expect(emptyStateIcon.textContent).toBe("👤");

        // Check that the empty state text is still present
        expect(
            screen.getByText("No personal information added yet")
        ).toBeInTheDocument();
        expect(
            screen.getByText('Click "Edit" to add your contact details')
        ).toBeInTheDocument();
    });

    it("matches the pattern used by Education and WorkExperience sections", () => {
        const mockOnUpdate = () => {};

        render(<PersonalInfo data={{}} onUpdate={mockOnUpdate} />);

        // Verify the structure matches other sections:
        // 1. emptyState container
        const emptyState = document.querySelector('[class*="emptyState"]');
        expect(emptyState).toBeTruthy();

        // 2. emptyStateIcon with emoji
        const emptyStateIcon = document.querySelector(
            '[class*="emptyStateIcon"]'
        );
        expect(emptyStateIcon).toBeTruthy();
        expect(emptyStateIcon.textContent).toBe("👤");

        // 3. emptyStateText
        const emptyStateText = document.querySelector(
            '[class*="emptyStateText"]'
        );
        expect(emptyStateText).toBeTruthy();

        // 4. emptyStateSubtext
        const emptyStateSubtext = document.querySelector(
            '[class*="emptyStateSubtext"]'
        );
        expect(emptyStateSubtext).toBeTruthy();
    });
});
