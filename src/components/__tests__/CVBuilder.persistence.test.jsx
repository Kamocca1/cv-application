/**
 * Integration Tests for CVBuilder Data Persistence
 *
 * Tests the complete data persistence workflow including:
 * - Cross-session data persistence
 * - Error recovery mechanisms
 * - Auto-save functionality
 * - Backup and restore operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CVBuilder from "../CVBuilder.jsx";
import { DEFAULT_CV_DATA, SECTIONS } from "../../models/dataTypes.js";

// Mock localStorage
const createMockStorage = () => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: vi.fn((index) => Object.keys(store)[index] || null),
        _getStore: () => store,
        _setStore: (newStore) => {
            store = newStore;
        },
    };
};

// Mock window and document events
const mockEventListeners = new Map();
const mockAddEventListener = vi.fn((event, callback) => {
    if (!mockEventListeners.has(event)) {
        mockEventListeners.set(event, []);
    }
    mockEventListeners.get(event).push(callback);
});

describe("CVBuilder Data Persistence Integration", () => {
    let mockStorage;
    let user;

    beforeEach(() => {
        user = userEvent.setup();
        mockStorage = createMockStorage();

        // Mock localStorage
        Object.defineProperty(window, "localStorage", {
            value: mockStorage,
            writable: true,
        });

        // Mock window events
        Object.defineProperty(window, "addEventListener", {
            value: mockAddEventListener,
            writable: true,
        });

        Object.defineProperty(document, "addEventListener", {
            value: mockAddEventListener,
            writable: true,
        });

        // Mock navigator.onLine
        Object.defineProperty(navigator, "onLine", {
            value: true,
            writable: true,
        });

        // Clear all mocks
        vi.clearAllMocks();
        mockEventListeners.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Initial Data Loading", () => {
        it("should load with default data when no saved data exists", async () => {
            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            expect(screen.getByText("CV Builder")).toBeInTheDocument();
            expect(
                screen.getByText("Start building your CV")
            ).toBeInTheDocument();
        });

        it("should load saved data on mount", async () => {
            const savedData = {
                ...DEFAULT_CV_DATA,
                [SECTIONS.PERSONAL_INFO]: {
                    name: "John Doe",
                    email: "john@example.com",
                    phone: "123-456-7890",
                },
            };

            mockStorage.setItem("cv-builder-data", JSON.stringify(savedData));

            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Check if the saved data is displayed
            expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("john@example.com")
            ).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("123-456-7890")
            ).toBeInTheDocument();
        });

        it("should handle corrupted saved data gracefully", async () => {
            mockStorage.setItem("cv-builder-data", "invalid json");

            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Should show error message and load default data
            expect(
                screen.getByText(/Failed to load saved data/)
            ).toBeInTheDocument();
            expect(
                screen.getByText("Start building your CV")
            ).toBeInTheDocument();
        });
    });

    describe("Auto-save Functionality", () => {
        it("should auto-save data after changes", async () => {
            vi.useFakeTimers();

            render(<CVBuilder autoSave={true} autoSaveDelay={1000} />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Make a change to personal info
            const nameInput = screen.getByLabelText(/name/i);
            await user.clear(nameInput);
            await user.type(nameInput, "Jane Doe");

            // Fast-forward time to trigger auto-save
            act(() => {
                vi.advanceTimersByTime(1000);
            });

            await waitFor(() => {
                const savedData = JSON.parse(
                    mockStorage.getItem("cv-builder-data")
                );
                expect(savedData[SECTIONS.PERSONAL_INFO].name).toBe("Jane Doe");
            });

            vi.useRealTimers();
        });

        it("should show saving indicator during save", async () => {
            vi.useFakeTimers();

            render(<CVBuilder autoSave={true} autoSaveDelay={500} />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Make a change
            const nameInput = screen.getByLabelText(/name/i);
            await user.clear(nameInput);
            await user.type(nameInput, "Test User");

            // Should show unsaved changes indicator
            expect(screen.getByText(/Unsaved changes/)).toBeInTheDocument();

            // Fast-forward to trigger save
            act(() => {
                vi.advanceTimersByTime(500);
            });

            // Should eventually clear the unsaved indicator
            await waitFor(() => {
                expect(
                    screen.queryByText(/Unsaved changes/)
                ).not.toBeInTheDocument();
            });

            vi.useRealTimers();
        });
    });

    describe("Manual Save Operations", () => {
        it("should save data when save button is clicked", async () => {
            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Make a change
            const nameInput = screen.getByLabelText(/name/i);
            await user.clear(nameInput);
            await user.type(nameInput, "Manual Save Test");

            // Click save button
            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                const savedData = JSON.parse(
                    mockStorage.getItem("cv-builder-data")
                );
                expect(savedData[SECTIONS.PERSONAL_INFO].name).toBe(
                    "Manual Save Test"
                );
            });
        });

        it("should update last saved time after save", async () => {
            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Initially should show "Never" or similar
            expect(screen.getByText(/Last saved:/)).toBeInTheDocument();

            // Make a change and save
            const nameInput = screen.getByLabelText(/name/i);
            await user.clear(nameInput);
            await user.type(nameInput, "Save Time Test");

            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText(/Just now|minute/)).toBeInTheDocument();
            });
        });
    });

    describe("Data Export and Import", () => {
        it("should export CV data", async () => {
            // Mock URL and Blob
            global.URL.createObjectURL = vi.fn(() => "mock-url");
            global.URL.revokeObjectURL = vi.fn();
            global.Blob = vi.fn();

            const mockLink = {
                href: "",
                download: "",
                click: vi.fn(),
            };

            document.createElement = vi.fn(() => mockLink);
            document.body.appendChild = vi.fn();
            document.body.removeChild = vi.fn();

            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Add some data first
            const nameInput = screen.getByLabelText(/name/i);
            await user.clear(nameInput);
            await user.type(nameInput, "Export Test");

            // Click export button
            const exportButton = screen.getByRole("button", {
                name: /export/i,
            });
            await user.click(exportButton);

            expect(global.Blob).toHaveBeenCalledWith(
                [expect.stringContaining("Export Test")],
                { type: "application/json" }
            );
            expect(mockLink.click).toHaveBeenCalled();
        });

        it("should import CV data from file", async () => {
            const importData = {
                ...DEFAULT_CV_DATA,
                [SECTIONS.PERSONAL_INFO]: {
                    name: "Imported User",
                    email: "imported@test.com",
                    phone: "987-654-3210",
                },
            };

            // Mock FileReader
            const mockFileReader = {
                readAsText: vi.fn(),
                onload: null,
                onerror: null,
                result: JSON.stringify(importData),
            };

            global.FileReader = vi.fn(() => mockFileReader);

            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Create a mock file
            const file = new File([JSON.stringify(importData)], "test.json", {
                type: "application/json",
            });

            // Find the import input (it's hidden)
            const importInput = screen
                .getByRole("button", { name: /import/i })
                .querySelector('input[type="file"]');

            // Simulate file selection
            await user.upload(importInput, file);

            // Simulate FileReader onload
            act(() => {
                mockFileReader.onload({
                    target: { result: JSON.stringify(importData) },
                });
            });

            await waitFor(() => {
                expect(
                    screen.getByDisplayValue("Imported User")
                ).toBeInTheDocument();
                expect(
                    screen.getByDisplayValue("imported@test.com")
                ).toBeInTheDocument();
                expect(
                    screen.getByDisplayValue("987-654-3210")
                ).toBeInTheDocument();
            });
        });
    });

    describe("Error Handling", () => {
        it("should handle localStorage errors gracefully", async () => {
            // Mock localStorage to throw errors
            mockStorage.setItem.mockImplementation(() => {
                throw new Error("Storage quota exceeded");
            });

            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Make a change that would trigger a save
            const nameInput = screen.getByLabelText(/name/i);
            await user.clear(nameInput);
            await user.type(nameInput, "Error Test");

            // Try to save manually
            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            // Should show error message
            await waitFor(() => {
                expect(
                    screen.getByText(/Failed to save data/)
                ).toBeInTheDocument();
            });
        });

        it("should show recovery notification when data is recovered", async () => {
            // Set up corrupted primary data and valid backup
            mockStorage.setItem("cv-builder-data", "corrupted json");

            const backupData = [
                {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    data: JSON.stringify({
                        ...DEFAULT_CV_DATA,
                        [SECTIONS.PERSONAL_INFO]: {
                            name: "Recovered User",
                            email: "recovered@test.com",
                            phone: "555-0123",
                        },
                    }),
                    size: 500,
                },
            ];

            mockStorage.setItem(
                "cv-builder-backup",
                JSON.stringify(backupData)
            );

            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Should show recovery notification
            expect(
                screen.getByText(/Your data was recovered from a backup/)
            ).toBeInTheDocument();

            // Should display recovered data
            expect(
                screen.getByDisplayValue("Recovered User")
            ).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("recovered@test.com")
            ).toBeInTheDocument();
        });

        it("should allow dismissing error messages", async () => {
            mockStorage.setItem.mockImplementation(() => {
                throw new Error("Save error");
            });

            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Trigger an error
            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                expect(
                    screen.getByText(/Failed to save data/)
                ).toBeInTheDocument();
            });

            // Dismiss the error
            const dismissButton = screen.getByRole("button", {
                name: /dismiss error/i,
            });
            await user.click(dismissButton);

            expect(
                screen.queryByText(/Failed to save data/)
            ).not.toBeInTheDocument();
        });
    });

    describe("Clear Data Functionality", () => {
        it("should clear all data when confirmed", async () => {
            // Mock window.confirm
            window.confirm = vi.fn(() => true);

            // Set up some initial data
            const initialData = {
                ...DEFAULT_CV_DATA,
                [SECTIONS.PERSONAL_INFO]: {
                    name: "Test User",
                    email: "test@example.com",
                    phone: "123-456-7890",
                },
            };

            mockStorage.setItem("cv-builder-data", JSON.stringify(initialData));

            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Verify data is loaded
            expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();

            // Click clear button
            const clearButton = screen.getByRole("button", { name: /clear/i });
            await user.click(clearButton);

            // Should show confirmation dialog
            expect(window.confirm).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Are you sure you want to clear all CV data"
                )
            );

            await waitFor(() => {
                // Data should be cleared
                expect(mockStorage.removeItem).toHaveBeenCalledWith(
                    "cv-builder-data"
                );
                expect(
                    screen.getByText("Start building your CV")
                ).toBeInTheDocument();
            });
        });

        it("should not clear data when cancelled", async () => {
            window.confirm = vi.fn(() => false);

            const initialData = {
                ...DEFAULT_CV_DATA,
                [SECTIONS.PERSONAL_INFO]: {
                    name: "Keep This Data",
                    email: "keep@example.com",
                    phone: "123-456-7890",
                },
            };

            mockStorage.setItem("cv-builder-data", JSON.stringify(initialData));

            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            const clearButton = screen.getByRole("button", { name: /clear/i });
            await user.click(clearButton);

            // Data should remain
            expect(
                screen.getByDisplayValue("Keep This Data")
            ).toBeInTheDocument();
            expect(mockStorage.removeItem).not.toHaveBeenCalled();
        });
    });

    describe("Cross-Session Persistence", () => {
        it("should persist data across component remounts", async () => {
            const testData = {
                ...DEFAULT_CV_DATA,
                [SECTIONS.PERSONAL_INFO]: {
                    name: "Persistent User",
                    email: "persistent@test.com",
                    phone: "555-1234",
                },
            };

            // First render - add data
            const { unmount } = render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            const nameInput = screen.getByLabelText(/name/i);
            await user.clear(nameInput);
            await user.type(nameInput, "Persistent User");

            const emailInput = screen.getByLabelText(/email/i);
            await user.clear(emailInput);
            await user.type(emailInput, "persistent@test.com");

            // Save the data
            const saveButton = screen.getByRole("button", { name: /save/i });
            await user.click(saveButton);

            await waitFor(() => {
                expect(mockStorage.setItem).toHaveBeenCalledWith(
                    "cv-builder-data",
                    expect.stringContaining("Persistent User")
                );
            });

            // Unmount component
            unmount();

            // Second render - should load persisted data
            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            expect(
                screen.getByDisplayValue("Persistent User")
            ).toBeInTheDocument();
            expect(
                screen.getByDisplayValue("persistent@test.com")
            ).toBeInTheDocument();
        });
    });

    describe("Storage Statistics", () => {
        it("should display storage information in footer", async () => {
            // Set up some backup data
            const backups = [
                { id: 1, timestamp: "2023-01-01", data: "{}", size: 100 },
                { id: 2, timestamp: "2023-01-02", data: "{}", size: 150 },
            ];
            mockStorage.setItem("cv-builder-backup", JSON.stringify(backups));

            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Should show backup count in footer
            expect(screen.getByText(/2 backups/)).toBeInTheDocument();
        });

        it("should show warning when storage is unavailable", async () => {
            // Mock storage as unavailable
            Object.defineProperty(window, "localStorage", {
                value: {
                    getItem: () => {
                        throw new Error("Not available");
                    },
                    setItem: () => {
                        throw new Error("Not available");
                    },
                    removeItem: () => {
                        throw new Error("Not available");
                    },
                },
                writable: true,
            });

            render(<CVBuilder />);

            await waitFor(() => {
                expect(
                    screen.queryByText("Loading your CV...")
                ).not.toBeInTheDocument();
            });

            // Should show storage warning
            expect(screen.getByText(/Storage unavailable/)).toBeInTheDocument();
        });
    });
});
