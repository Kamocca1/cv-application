/**
 * Tests for useDataPersistence Hook
 *
 * Tests React hook integration, auto-save functionality,
 * error handling, and user interactions.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDataPersistence } from "../useDataPersistence.js";
import { storageManager } from "../storageManager.js";
import { DEFAULT_CV_DATA, SECTIONS } from "../../models/dataTypes.js";

// Mock storageManager
vi.mock("../storageManager.js", () => ({
    storageManager: {
        loadData: vi.fn(),
        saveData: vi.fn(),
        clearAllData: vi.fn(),
        getBackups: vi.fn(),
        validateData: vi.fn(),
        sanitizeData: vi.fn(),
        getStorageStats: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
    },
    STORAGE_EVENTS: {
        SAVE_SUCCESS: "storage:save:success",
        SAVE_ERROR: "storage:save:error",
        LOAD_SUCCESS: "storage:load:success",
        LOAD_ERROR: "storage:load:error",
        RECOVERY_SUCCESS: "storage:recovery:success",
    },
}));

// Mock URL and Blob for export functionality
global.URL = {
    createObjectURL: vi.fn(() => "mock-url"),
    revokeObjectURL: vi.fn(),
};

global.Blob = vi.fn((content, options) => ({
    content,
    options,
}));

// Mock FileReader for import functionality
global.FileReader = vi.fn(() => ({
    readAsText: vi.fn(),
    onload: null,
    onerror: null,
    result: null,
}));

describe("useDataPersistence", () => {
    let mockFile;
    let mockLink;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock implementations
        storageManager.loadData.mockResolvedValue({
            data: DEFAULT_CV_DATA,
            recovered: false,
        });
        storageManager.saveData.mockResolvedValue(true);
        storageManager.clearAllData.mockResolvedValue(true);
        storageManager.getBackups.mockReturnValue([]);
        storageManager.validateData.mockReturnValue({ isValid: true });
        storageManager.sanitizeData.mockImplementation((data) => data);
        storageManager.getStorageStats.mockReturnValue({
            isAvailable: true,
            totalSize: 1024,
            saveCount: 5,
            backupCount: 2,
        });

        // Mock DOM elements
        mockLink = {
            href: "",
            download: "",
            click: vi.fn(),
        };

        document.createElement = vi.fn((tagName) => {
            if (tagName === "a") return mockLink;
            return {};
        });

        document.body.appendChild = vi.fn();
        document.body.removeChild = vi.fn();

        // Mock file for testing
        mockFile = new File(["test content"], "test.json", {
            type: "application/json",
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Initialization", () => {
        it("should initialize with loading state", () => {
            const { result } = renderHook(() => useDataPersistence());

            expect(result.current.isLoading).toBe(true);
            expect(result.current.data).toEqual(DEFAULT_CV_DATA);
        });

        it("should load data on mount", async () => {
            const testData = {
                ...DEFAULT_CV_DATA,
                [SECTIONS.PERSONAL_INFO]: {
                    name: "Test",
                    email: "test@test.com",
                    phone: "123",
                },
            };

            storageManager.loadData.mockResolvedValue({
                data: testData,
                recovered: false,
            });

            const { result } = renderHook(() => useDataPersistence());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.data).toEqual(testData);
            expect(result.current.isRecovered).toBe(false);
        });

        it("should handle load errors", async () => {
            const mockOnLoadError = vi.fn();
            storageManager.loadData.mockRejectedValue(new Error("Load failed"));

            const { result } = renderHook(() =>
                useDataPersistence({ onLoadError: mockOnLoadError })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(mockOnLoadError).toHaveBeenCalledWith(expect.any(Error));
            expect(result.current.saveError).toContain(
                "Failed to load saved data"
            );
        });

        it("should handle recovered data", async () => {
            const mockOnRecovery = vi.fn();
            const recoveredData = { ...DEFAULT_CV_DATA };

            storageManager.loadData.mockResolvedValue({
                data: recoveredData,
                recovered: true,
            });

            const { result } = renderHook(() =>
                useDataPersistence({ onRecovery: mockOnRecovery })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isRecovered).toBe(true);
            expect(mockOnRecovery).toHaveBeenCalledWith(recoveredData);
        });
    });

    describe("Auto-save Functionality", () => {
        it("should auto-save when data changes", async () => {
            vi.useFakeTimers();

            const { result } = renderHook(() =>
                useDataPersistence({ autoSave: true, autoSaveDelay: 1000 })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Update data
            const newData = {
                ...DEFAULT_CV_DATA,
                [SECTIONS.PERSONAL_INFO]: {
                    name: "Updated",
                    email: "",
                    phone: "",
                },
            };

            act(() => {
                result.current.updateData(newData);
            });

            // Fast-forward time to trigger auto-save
            act(() => {
                vi.advanceTimersByTime(1000);
            });

            await waitFor(() => {
                expect(storageManager.saveData).toHaveBeenCalledWith(
                    newData,
                    expect.objectContaining({
                        priority: "normal",
                        source: "auto-save",
                    })
                );
            });

            vi.useRealTimers();
        });

        it("should not auto-save when disabled", async () => {
            vi.useFakeTimers();

            const { result } = renderHook(() =>
                useDataPersistence({ autoSave: false })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Update data
            act(() => {
                result.current.updateData({
                    ...DEFAULT_CV_DATA,
                    [SECTIONS.PERSONAL_INFO]: {
                        name: "Updated",
                        email: "",
                        phone: "",
                    },
                });
            });

            // Fast-forward time
            act(() => {
                vi.advanceTimersByTime(5000);
            });

            expect(storageManager.saveData).not.toHaveBeenCalled();

            vi.useRealTimers();
        });

        it("should debounce multiple rapid changes", async () => {
            vi.useFakeTimers();

            const { result } = renderHook(() =>
                useDataPersistence({ autoSave: true, autoSaveDelay: 1000 })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Make multiple rapid changes
            act(() => {
                result.current.updateData({
                    ...DEFAULT_CV_DATA,
                    [SECTIONS.PERSONAL_INFO]: {
                        name: "Change 1",
                        email: "",
                        phone: "",
                    },
                });
            });

            act(() => {
                vi.advanceTimersByTime(500);
            });

            act(() => {
                result.current.updateData({
                    ...DEFAULT_CV_DATA,
                    [SECTIONS.PERSONAL_INFO]: {
                        name: "Change 2",
                        email: "",
                        phone: "",
                    },
                });
            });

            act(() => {
                vi.advanceTimersByTime(500);
            });

            act(() => {
                result.current.updateData({
                    ...DEFAULT_CV_DATA,
                    [SECTIONS.PERSONAL_INFO]: {
                        name: "Final Change",
                        email: "",
                        phone: "",
                    },
                });
            });

            // Fast-forward to trigger save
            act(() => {
                vi.advanceTimersByTime(1000);
            });

            // Should only save once with the final data
            await waitFor(() => {
                expect(storageManager.saveData).toHaveBeenCalledTimes(1);
            });

            vi.useRealTimers();
        });
    });

    describe("Manual Save Operations", () => {
        it("should perform manual save", async () => {
            const { result } = renderHook(() => useDataPersistence());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let saveResult;
            await act(async () => {
                saveResult = await result.current.saveData();
            });

            expect(saveResult).toBe(true);
            expect(storageManager.saveData).toHaveBeenCalledWith(
                DEFAULT_CV_DATA,
                expect.objectContaining({ priority: "high", source: "manual" })
            );
        });

        it("should handle save errors", async () => {
            const mockOnSaveError = vi.fn();
            storageManager.saveData.mockRejectedValue(new Error("Save failed"));

            const { result } = renderHook(() =>
                useDataPersistence({ onSaveError: mockOnSaveError })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let saveResult;
            await act(async () => {
                saveResult = await result.current.saveData();
            });

            expect(saveResult).toBe(false);
        });

        it("should force save pending changes", async () => {
            vi.useFakeTimers();

            const { result } = renderHook(() =>
                useDataPersistence({ autoSave: true, autoSaveDelay: 5000 })
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Make a change but don't wait for auto-save
            act(() => {
                result.current.updateData({
                    ...DEFAULT_CV_DATA,
                    [SECTIONS.PERSONAL_INFO]: {
                        name: "Updated",
                        email: "",
                        phone: "",
                    },
                });
            });

            // Force save immediately
            await act(async () => {
                await result.current.forceSave();
            });

            expect(storageManager.saveData).toHaveBeenCalledWith(
                expect.objectContaining({
                    [SECTIONS.PERSONAL_INFO]: expect.objectContaining({
                        name: "Updated",
                    }),
                }),
                expect.objectContaining({ priority: "high", source: "force" })
            );

            vi.useRealTimers();
        });
    });

    describe("Data Management", () => {
        it("should clear all data", async () => {
            const { result } = renderHook(() => useDataPersistence());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let clearResult;
            await act(async () => {
                clearResult = await result.current.clearData();
            });

            expect(clearResult).toBe(true);
            expect(storageManager.clearAllData).toHaveBeenCalled();
            expect(result.current.data).toEqual(DEFAULT_CV_DATA);
        });

        it("should export data", async () => {
            const { result } = renderHook(() => useDataPersistence());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let exportResult;
            act(() => {
                exportResult = result.current.exportData();
            });

            expect(exportResult).toBe(true);
            expect(global.Blob).toHaveBeenCalledWith(
                [JSON.stringify(DEFAULT_CV_DATA, null, 2)],
                { type: "application/json" }
            );
            expect(mockLink.click).toHaveBeenCalled();
        });

        it("should import data from file", async () => {
            const importData = {
                ...DEFAULT_CV_DATA,
                [SECTIONS.PERSONAL_INFO]: {
                    name: "Imported",
                    email: "imported@test.com",
                    phone: "456",
                },
            };

            storageManager.validateData.mockReturnValue({ isValid: true });
            storageManager.sanitizeData.mockReturnValue(importData);

            const { result } = renderHook(() => useDataPersistence());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Mock FileReader
            const mockFileReader = {
                readAsText: vi.fn(),
                onload: null,
                onerror: null,
                result: JSON.stringify(importData),
            };
            global.FileReader.mockImplementation(() => mockFileReader);

            let importResult;
            await act(async () => {
                const importPromise = result.current.importData(mockFile);

                // Simulate successful file read
                mockFileReader.onload({
                    target: { result: JSON.stringify(importData) },
                });

                importResult = await importPromise;
            });

            expect(importResult).toEqual(importData);
            expect(result.current.data).toEqual(importData);
        });

        it("should handle import errors", async () => {
            const { result } = renderHook(() => useDataPersistence());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Mock FileReader with error
            const mockFileReader = {
                readAsText: vi.fn(),
                onload: null,
                onerror: null,
            };
            global.FileReader.mockImplementation(() => mockFileReader);

            await act(async () => {
                const importPromise = result.current.importData(mockFile);

                // Simulate file read error
                mockFileReader.onerror();

                try {
                    await importPromise;
                } catch (error) {
                    expect(error.message).toBe("Failed to read file");
                }
            });

            expect(result.current.saveError).toBe("Failed to read file");
        });
    });

    describe("Backup Operations", () => {
        it("should get backup list", () => {
            const mockBackups = [
                { id: 1, timestamp: "2023-01-01", data: "{}", size: 100 },
                { id: 2, timestamp: "2023-01-02", data: "{}", size: 150 },
            ];

            storageManager.getBackups.mockReturnValue(mockBackups);

            const { result } = renderHook(() => useDataPersistence());

            const backups = result.current.getBackups();
            expect(backups).toEqual(mockBackups);
        });

        it("should restore from backup", async () => {
            const backupData = {
                ...DEFAULT_CV_DATA,
                [SECTIONS.PERSONAL_INFO]: {
                    name: "Backup",
                    email: "backup@test.com",
                    phone: "789",
                },
            };

            const mockBackups = [
                {
                    id: 1,
                    timestamp: "2023-01-01",
                    data: JSON.stringify(backupData),
                    size: 100,
                },
            ];

            storageManager.getBackups.mockReturnValue(mockBackups);

            const { result } = renderHook(() => useDataPersistence());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let restoreResult;
            await act(async () => {
                restoreResult = await result.current.restoreFromBackup(1);
            });

            expect(restoreResult).toBe(true);
            expect(result.current.data).toEqual(backupData);
        });

        it("should handle restore errors", async () => {
            storageManager.getBackups.mockReturnValue([]);

            const { result } = renderHook(() => useDataPersistence());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let restoreResult;
            await act(async () => {
                restoreResult = await result.current.restoreFromBackup(999);
            });

            expect(restoreResult).toBe(false);
            expect(result.current.saveError).toBe(
                "Failed to restore from backup"
            );
        });
    });

    describe("Change Detection", () => {
        it("should detect unsaved changes", async () => {
            const { result } = renderHook(() => useDataPersistence());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Initially no unsaved changes
            expect(result.current.hasUnsavedChanges()).toBe(false);

            // Make a change
            act(() => {
                result.current.updateData({
                    ...DEFAULT_CV_DATA,
                    [SECTIONS.PERSONAL_INFO]: {
                        name: "Changed",
                        email: "",
                        phone: "",
                    },
                });
            });

            expect(result.current.hasUnsavedChanges()).toBe(true);
        });

        it("should clear unsaved changes after save", async () => {
            const { result } = renderHook(() => useDataPersistence());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Make a change
            act(() => {
                result.current.updateData({
                    ...DEFAULT_CV_DATA,
                    [SECTIONS.PERSONAL_INFO]: {
                        name: "Changed",
                        email: "",
                        phone: "",
                    },
                });
            });

            expect(result.current.hasUnsavedChanges()).toBe(true);

            // Save the changes
            await act(async () => {
                await result.current.saveData();
            });

            expect(result.current.hasUnsavedChanges()).toBe(false);
        });
    });

    describe("Storage Statistics", () => {
        it("should provide storage statistics", async () => {
            const mockStats = {
                isAvailable: true,
                totalSize: 2048,
                saveCount: 10,
                backupCount: 3,
            };

            storageManager.getStorageStats.mockReturnValue(mockStats);

            const { result } = renderHook(() => useDataPersistence());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.storageStats).toEqual(mockStats);
        });
    });

    describe("Event Handling", () => {
        it("should handle save success events", async () => {
            const mockOnSaveSuccess = vi.fn();
            let saveSuccessCallback;

            storageManager.on.mockImplementation((event, callback) => {
                if (event === "storage:save:success") {
                    saveSuccessCallback = callback;
                }
            });

            renderHook(() =>
                useDataPersistence({ onSaveSuccess: mockOnSaveSuccess })
            );

            // Simulate save success event
            act(() => {
                saveSuccessCallback({ timestamp: "2023-01-01", size: 1024 });
            });

            expect(mockOnSaveSuccess).toHaveBeenCalledWith({
                timestamp: "2023-01-01",
                size: 1024,
            });
        });

        it("should handle save error events", async () => {
            const mockOnSaveError = vi.fn();
            let saveErrorCallback;

            storageManager.on.mockImplementation((event, callback) => {
                if (event === "storage:save:error") {
                    saveErrorCallback = callback;
                }
            });

            const { result } = renderHook(() =>
                useDataPersistence({ onSaveError: mockOnSaveError })
            );

            // Simulate save error event
            act(() => {
                saveErrorCallback({ error: "Save failed" });
            });

            expect(mockOnSaveError).toHaveBeenCalledWith(
                new Error("Save failed")
            );
            expect(result.current.saveError).toBe("Save failed");
        });
    });
});
