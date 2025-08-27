import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "../App.jsx";

// Mock the CVBuilder component since we're testing App integration
vi.mock("../components/CVBuilder.jsx", () => ({
    default: ({ onDataChange, autoSave, autoSaveDelay, className }) => (
        <div
            data-testid="cv-builder-mock"
            data-auto-save={autoSave}
            data-auto-save-delay={autoSaveDelay}
            className={className}
        >
            CVBuilder Component
        </div>
    ),
}));

describe("App Component", () => {
    it("renders the main app structure", () => {
        render(<App />);

        // Check for main app elements
        expect(screen.getByRole("banner")).toBeInTheDocument(); // header
        expect(screen.getByRole("main")).toBeInTheDocument(); // main content
        expect(screen.getByRole("contentinfo")).toBeInTheDocument(); // footer
    });

    it("renders the app title", () => {
        render(<App />);

        expect(screen.getByText("Professional CV Builder")).toBeInTheDocument();
    });

    it("renders the CVBuilder component with correct props", () => {
        render(<App />);

        const cvBuilder = screen.getByTestId("cv-builder-mock");
        expect(cvBuilder).toBeInTheDocument();
        expect(cvBuilder).toHaveAttribute("data-auto-save", "true");
        expect(cvBuilder).toHaveAttribute("data-auto-save-delay", "2000");
        expect(cvBuilder).toHaveClass("cv-builder-main");
    });

    it("renders footer information", () => {
        render(<App />);

        expect(screen.getByText(/Built with React/)).toBeInTheDocument();
        expect(screen.getByText("Version 1.0.0")).toBeInTheDocument();
    });

    it("renders online status indicator", () => {
        render(<App />);

        const statusIndicator = screen.getByTitle(/Online|Offline/);
        expect(statusIndicator).toBeInTheDocument();
    });

    it("applies correct CSS classes", () => {
        render(<App />);

        const appDiv = screen.getByRole("banner").closest(".app");
        expect(appDiv).toHaveAttribute("data-theme", "light");
    });
});
