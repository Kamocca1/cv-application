import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import App from "../App.jsx";

describe("App Integration Tests", () => {
    let mockLocalStorage;

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        };
        Object.defineProperty(window, "localStorage", {
            value: mockLocalStorage,
            writable: true,
        });

        // Mock navigator.onLine
        Object.defineProperty(navigator, "onLine", {
            value: true,
            writable: true,
        });

        // Mock console.log to avoid noise in tests
        vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders complete application structure", () => {
        render(<App />);

        // Check main structural elements
        expect(screen.getByRole("banner")).toBeInTheDocument();
        expect(screen.getByRole("main")).toBeInTheDocument();
        expect(screen.getByRole("contentinfo")).toBeInTheDocument();

        // Check key content
        expect(screen.getByText("Professional CV Builder")).toBeInTheDocument();
        expect(screen.getByText(/Built with React/)).toBeInTheDocument();
    });

    it("handles online/offline status changes", async () => {
        render(<App />);

        // Initially online
        const statusIndicator = screen.getByTitle(/Online/);
        expect(statusIndicator).toBeInTheDocument();

        // Simulate going offline
        Object.defineProperty(navigator, "onLine", {
            value: false,
            writable: true,
        });
        fireEvent(window, new Event("offline"));

        await waitFor(() => {
            const offlineIndicator = screen.getByTitle(/Offline/);
            expect(offlineIndicator).toBeInTheDocument();
        });
    });

    it("applies correct theme data attribute", () => {
        render(<App />);

        const appContainer = document.querySelector(".app");
        expect(appContainer).toHaveAttribute("data-theme", "light");
    });

    it("provides proper layout structure for responsive design", () => {
        render(<App />);

        const header = screen.getByRole("banner");
        const main = screen.getByRole("main");
        const footer = screen.getByRole("contentinfo");

        expect(header).toHaveClass("app-header");
        expect(main).toHaveClass("app-main");
        expect(footer).toHaveClass("app-footer");
    });

    it("passes correct props to CVBuilder", () => {
        render(<App />);

        // CVBuilder should be rendered with proper className
        const cvBuilderContainer = document.querySelector(".cv-builder-main");
        expect(cvBuilderContainer).toBeInTheDocument();
    });
});
