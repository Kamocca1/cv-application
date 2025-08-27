import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import CVBuilder from "../CVBuilder.jsx";
import { DEFAULT_CV_DATA } from "../../models/dataTypes.js";

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
});

// Mock window.confirm
Object.defineProperty(window, "confirm", {
    value: vi.fn(() => true),
});

// Mock URL.createObjectURL and related APIs for export functionality
Object.defineProperty(URL, "createObjectURL", {
    value: vi.fn(() => "mock-url"),
});
Object.defineProperty(URL, "revokeObjectURL", {
    value: vi.fn(),
});

describe("CVBuilder Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    test("renders CVBuilder component", async () => {
        render(<CVBuilder />);

        // Wait for loading to complete
        await waitFor(() => {
            expect(
                screen.queryByText("Loading your CV...")
            ).not.toBeInTheDocument();
        });

        expect(screen.getByText("CV Builder")).toBeInTheDocument();
        expect(screen.getByText("Personal Information")).toBeInTheDocument();
        expect(screen.getByText("Education")).toBeInTheDocument();
        expect(screen.getByText("Work Experience")).toBeInTheDocument();
    });

    test("loads data from localStorage on mount", async () => {
        const savedData = {
            personalInfo: {
                name: "John Doe",
                email: "john@example.com",
                phone: "123-456-7890",
            },
            education: [],
            workExperience: [],
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

        render(<CVBuilder />);

        await waitFor(() => {
            expect(
                screen.queryByText("Loading your CV...")
            ).not.toBeInTheDocument();
        });

        expect(localStorageMock.getItem).toHaveBeenCalledWith(
            "cv-builder-data"
        );
        expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    });

    test("saves data to localStorage when updated", async () => {
        render(<CVBuilder />);

        await waitFor(() => {
            expect(
                screen.queryByText("Loading your CV...")
            ).not.toBeInTheDocument();
        });

        // Wait for initial save
        await waitFor(() => {
            expect(localStorageMock.setItem).toHaveBeenCalled();
        });

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            "cv-builder-data",
            JSON.stringify(DEFAULT_CV_DATA)
        );
    });

    test("handles manual save", async () => {
        render(<CVBuilder />);

        await waitFor(() => {
            expect(
                screen.queryByText("Loading your CV...")
            ).not.toBeInTheDocument();
        });

        const saveButton = screen.getByText("💾 Save");
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(localStorageMock.setItem).toHaveBeenCalled();
        });
    });

    test("handles clear data", async () => {
        render(<CVBuilder />);

        await waitFor(() => {
            expect(
                screen.queryByText("Loading your CV...")
            ).not.toBeInTheDocument();
        });

        const clearButton = screen.getByText("🗑️ Clear");
        fireEvent.click(clearButton);

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to clear all CV data? This action cannot be undone."
        );
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
            "cv-builder-data"
        );
    });

    test("handles export data", async () => {
        // Mock document.createElement and related DOM methods
        const mockLink = {
            href: "",
            download: "",
            click: vi.fn(),
        };
        const createElementSpy = vi
            .spyOn(document, "createElement")
            .mockReturnValue(mockLink);
        const appendChildSpy = vi
            .spyOn(document.body, "appendChild")
            .mockImplementation(() => {});
        const removeChildSpy = vi
            .spyOn(document.body, "removeChild")
            .mockImplementation(() => {});

        render(<CVBuilder />);

        await waitFor(() => {
            expect(
                screen.queryByText("Loading your CV...")
            ).not.toBeInTheDocument();
        });

        const exportButton = screen.getByText("📤 Export");
        fireEvent.click(exportButton);

        expect(createElementSpy).toHaveBeenCalledWith("a");
        expect(mockLink.download).toBe("cv-data.json");
        expect(mockLink.click).toHaveBeenCalled();
        expect(URL.createObjectURL).toHaveBeenCalled();
        expect(URL.revokeObjectURL).toHaveBeenCalled();

        // Cleanup
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
    });

    test("calls onDataChange when data updates", async () => {
        const onDataChange = vi.fn();
        render(<CVBuilder onDataChange={onDataChange} />);

        await waitFor(() => {
            expect(
                screen.queryByText("Loading your CV...")
            ).not.toBeInTheDocument();
        });

        // Wait for initial data change call
        await waitFor(() => {
            expect(onDataChange).toHaveBeenCalled();
        });
    });

    test("handles localStorage errors gracefully", async () => {
        localStorageMock.getItem.mockImplementation(() => {
            throw new Error("localStorage error");
        });

        const consoleSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        render(<CVBuilder />);

        await waitFor(() => {
            expect(
                screen.queryByText("Loading your CV...")
            ).not.toBeInTheDocument();
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            "Error loading CV data from localStorage:",
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    test("displays auto-save info when enabled", async () => {
        render(<CVBuilder autoSave={true} />);

        await waitFor(() => {
            expect(
                screen.queryByText("Loading your CV...")
            ).not.toBeInTheDocument();
        });

        expect(screen.getByText("Auto-save enabled")).toBeInTheDocument();
    });

    test("does not display auto-save info when disabled", async () => {
        render(<CVBuilder autoSave={false} />);

        await waitFor(() => {
            expect(
                screen.queryByText("Loading your CV...")
            ).not.toBeInTheDocument();
        });

        expect(screen.queryByText("Auto-save enabled")).not.toBeInTheDocument();
    });

    test("updates personal info section", async () => {
        render(<CVBuilder />);

        await waitFor(() => {
            expect(
                screen.queryByText("Loading your CV...")
            ).not.toBeInTheDocument();
        });

        // Click edit on personal info section
        const editButtons = screen.getAllByText("Edit");
        fireEvent.click(editButtons[0]); // First edit button should be personal info

        // Wait for edit mode
        await waitFor(() => {
            expect(
                screen.getByPlaceholderText("Enter your full name")
            ).toBeInTheDocument();
        });

        // Update name field
        const nameInput = screen.getByPlaceholderText("Enter your full name");
        fireEvent.change(nameInput, { target: { value: "Jane Doe" } });

        // Save changes
        const saveButton = screen.getByText("Save");
        fireEvent.click(saveButton);

        // Verify data was updated
        await waitFor(() => {
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "cv-builder-data",
                expect.stringContaining("Jane Doe")
            );
        });
    });
});
