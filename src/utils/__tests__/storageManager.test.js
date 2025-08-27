/**
 * Tests for StorageManager
 *
 * Tests data persistence, error handling, recovery mechanisms,
 * and cross-session functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { storageManager, STORAGE_EVENTS } from "../storageManager.js";
import { DEFAULT_CV_DATA, SECTIONS } from "../../models/dataTypes.js";

// Mock localStorage
const localStorageMock = (() => {
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
    };
})();

// Mock window events
const mockEventListeners = new Map();
const mockAddEventListener = vi.fn((event, callback) => {
    if (!mockEventListeners.has(event)) {
        mockEventListeners.set(event, []);
    }
    mockEventListeners.get(event).push(callback);
});

const mockRemoveEventListener = vi.fn((event, callback) => {
    if (mockEventListeners.has(event)) {
        const listeners = mockEventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }
});

describe("StorageManager", () => {
    beforeEach(() => {
        // Reset localStorage mock
        localStorageMock.clear();
        vi.clearAllMocks();

        // Mock global objects
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
            writable: true,
        });

        Object.defineProperty(window, "addEventListener", {
            value: mockAddEventListener,
            writable: true,
        });

        Object.defineProperty(window, "removeEventListener", {
            value: mockRemoveEventListener,
            writable: true,
        });

        Object.defineProperty(document, "addEventListener", {
            value: mockAddEventListener,
            writable: true,
        });

        // Reset storage manager state
        storageManager.eventListeners.clear();
        storageManager.saveQueue = [];
        storageManager.isProcessingQueue = false;
        storageManager.lastSaveTime = null;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Storage Availability", () => {
        it("should detect localStorage availability", () => {
            expect(storageManager.isAvailable).toBe(true);
        });

        it("should handle localStorage unavailability", () => {
            // Mock localStorage to throw error
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error("localStorage not available");
            });

            const newStorageManager = new storageManager.constructor();
            expect(newStorageManager.isAvailable).toBe(false);
        });
    });

    describe("Data Validation", () => {
        it("should validate correct CV data structure", () => {
            const validData = {
                [SECTIONS.PERSONAL_INFO]: {
                    name: "John",
                    email: "john@test.com",
                    phone: "123",
                },
                [SECTIONS.EDUCATION]: [],
                [SECTIONS.WORK_EXPERIENCE]: [],
            };

            const result = storageManager.validateData(validData);
            expect(result.isValid).toBe(true);
        });

        it("should reject invalid data structure", () => {
            const invalidData = { invalid: "data" };

            const result = storageManager.validateData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("Missing section");
        });

        it("should reject non-object data", () => {
            const result = storageManager.validateData("invalid");
            expect(result.isValid).toBe(false);
            expect(result.error).toBe("Data is not an object");
        });

        it("should reject data with invalid arrays", () => {
            const invalidData = {
                [SECTIONS.PERSONAL_INFO]: {},
                [SECTIONS.EDUCATION]: "not an array",
                [SECTIONS.WORK_EXPERIENCE]: [],
            };

            const result = storageManager.validateData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe("Education must be an array");
        });
    });

    describe("Data Sanitization", () => {
        it("should sanitize and merge data with defaults", () => {
            const partialData = {
                [SECTIONS.PERSONAL_INFO]: { name: "John" },
            };

            const sanitized = storageManager.sanitizeData(partialData);

            expect(sanitized[SECTIONS.PERSONAL_INFO]).toEqual({
                ...DEFAULT_CV_DATA[SECTIONS.PERSONAL_INFO],
                name: "John",
            });
            expect(Array.isArray(sanitized[SECTIONS.EDUCATION])).toBe(true);
            expect(Array.isArray(sanitized[SECTIONS.WORK_EXPERIENCE])).toBe(
                true
            );
        });

        it("should handle missing sections", () => {
            const incompleteData = {};

            const sanitized = storageManager.sanitizeData(incompleteData);

            expect(sanitized).toEqual(DEFAULT_CV_DATA);
        });
    });

    describe("Save Operations", () => {
        it("should save valid data successfully", async () => {
            const testData = DEFAULT_CV_DATA;

            const result = await storageManager.saveData(testData);

            expect(result).toBe(true);
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "cv-builder-data",
                JSON.stringify(testData)
            );
        });

        it("should handle save errors gracefully", async () => {
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error("Storage full");
            });

            const testData = DEFAULT_CV_DATA;

            await expect(storageManager.saveData(testData)).rejects.toThrow(
                "Storage full"
            );
        });

        it("should create backups when requested", async () => {
            // First save some data
            localStorageMock.setItem(
                "cv-builder-data",
                JSON.stringify(DEFAULT_CV_DATA)
            );

            const testData = { ...DEFAULT_CV_DATA };
            testData[SECTIONS.PERSONAL_INFO].name = "Updated";

            await storageManager.saveData(testData, { createBackup: true });

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                "cv-builder-backup",
                expect.any(String)
            );
        });

        it("should queue multiple save operations", async () => {
            const data1 = { ...DEFAULT_CV_DATA };
            const data2 = { ...DEFAULT_CV_DATA };

            // Queue multiple saves
            const promise1 = storageManager.saveData(data1);
            const promise2 = storageManager.saveData(data2);

            await Promise.all([promise1, promise2]);

            expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
        });
    });

    describe("Load Operations", () => {
        it("should load valid data successfully", async () => {
            const testData = DEFAULT_CV_DATA;
            localStorageMock.setItem(
                "cv-builder-data",
                JSON.stringify(testData)
            );

            const result = await storageManager.loadData();

            expect(result.data).toEqual(testData);
            expect(result.recovered).toBe(false);
        });

        it("should return default data when no saved data exists", async () => {
            const result = await storageManager.loadData();

            expect(result.data).toEqual(DEFAULT_CV_DATA);
            expect(result.recovered).toBe(false);
        });

        it("should handle corrupted primary data", async () => {
            localStorageMock.setItem("cv-builder-data", "invalid json");

            const result = await storageManager.loadData();

            expect(result.data).toEqual(DEFAULT_CV_DATA);
            expect(result.recovered).toBe(false);
        });

        it("should recover from backup when primary data is corrupted", async () => {
            // Set corrupted primary data
            localStorageMock.setItem("cv-builder-data", "invalid json");

            // Set valid backup data
            const backupData = [
                {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    data: JSON.stringify(DEFAULT_CV_DATA),
                    size: 100,
                },
            ];
            localStorageMock.setItem(
                "cv-builder-backup",
                JSON.stringify(backupData)
            );

            const result = await storageManager.loadData();

            expect(result.data).toEqual(DEFAULT_CV_DATA);
            expect(result.recovered).toBe(true);
        });
    });

    describe("Backup Management", () => {
        it("should create backups with proper structure", async () => {
            const testData = JSON.stringify(DEFAULT_CV_DATA);
            localStorageMock.setItem("cv-builder-data", testData);

            const success = await storageManager.createBackup();

            expect(success).toBe(true);

            const backups = storageManager.getBackups();
            expect(backups).toHaveLength(1);
            expect(backups[0]).toHaveProperty("id");
            expect(backups[0]).toHaveProperty("timestamp");
            expect(backups[0]).toHaveProperty("data");
            expect(backups[0]).toHaveProperty("size");
        });

        it("should limit backup count", async () => {
            const testData = JSON.stringify(DEFAULT_CV_DATA);
            localStorageMock.setItem("cv-builder-data", testData);

            // Create more backups than the limit
            for (let i = 0; i < 7; i++) {
                await storageManager.createBackup();
                // Add small delay to ensure different timestamps
                await new Promise((resolve) => setTimeout(resolve, 1));
            }

            const backups = storageManager.getBackups();
            expect(backups.length).toBeLessThanOrEqual(5); // MAX_BACKUP_COUNT
        });

        it("should handle backup creation errors", async () => {
            localStorageMock.setItem.mockImplementation((key) => {
                if (key === "cv-builder-backup") {
                    throw new Error("Backup failed");
                }
            });

            const success = await storageManager.createBackup();
            expect(success).toBe(false);
        });
    });

    describe("Event System", () => {
        it("should emit save success events", async () => {
            const mockCallback = vi.fn();
            storageManager.on(STORAGE_EVENTS.SAVE_SUCCESS, mockCallback);

            await storageManager.saveData(DEFAULT_CV_DATA);

            expect(mockCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    timestamp: expect.any(String),
                    size: expect.any(Number),
                })
            );
        });

        it("should emit save error events", async () => {
            const mockCallback = vi.fn();
            storageManager.on(STORAGE_EVENTS.SAVE_ERROR, mockCallback);

            localStorageMock.setItem.mockImplementation(() => {
                throw new Error("Save failed");
            });

            try {
                await storageManager.saveData(DEFAULT_CV_DATA);
            } catch (error) {
                // Expected to throw
            }

            expect(mockCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.any(String),
                })
            );
        });

        it("should remove event listeners", () => {
            const mockCallback = vi.fn();

            storageManager.on(STORAGE_EVENTS.SAVE_SUCCESS, mockCallback);
            storageManager.off(STORAGE_EVENTS.SAVE_SUCCESS, mockCallback);

            // Manually emit event to test removal
            storageManager.emit(STORAGE_EVENTS.SAVE_SUCCESS, {});

            expect(mockCallback).not.toHaveBeenCalled();
        });
    });

    describe("Storage Statistics", () => {
        it("should provide accurate storage statistics", () => {
            const stats = storageManager.getStorageStats();

            expect(stats).toHaveProperty("isAvailable");
            expect(stats).toHaveProperty("totalSize");
            expect(stats).toHaveProperty("saveCount");
            expect(stats).toHaveProperty("backupCount");
            expect(stats).toHaveProperty("version");
        });

        it("should calculate total storage size", () => {
            localStorageMock.setItem("cv-builder-data", "test data");
            localStorageMock.setItem("cv-builder-backup", "backup data");

            const stats = storageManager.getStorageStats();

            expect(stats.totalSize).toBeGreaterThan(0);
        });
    });

    describe("Data Clearing", () => {
        it("should clear all stored data", async () => {
            localStorageMock.setItem("cv-builder-data", "test");
            localStorageMock.setItem("cv-builder-backup", "test");
            localStorageMock.setItem("cv-builder-metadata", "test");

            const success = await storageManager.clearAllData();

            expect(success).toBe(true);
            expect(localStorageMock.removeItem).toHaveBeenCalledWith(
                "cv-builder-data"
            );
            expect(localStorageMock.removeItem).toHaveBeenCalledWith(
                "cv-builder-backup"
            );
            expect(localStorageMock.removeItem).toHaveBeenCalledWith(
                "cv-builder-metadata"
            );
        });
    });

    describe("Emergency Handlers", () => {
        it("should set up beforeunload handler", () => {
            expect(mockAddEventListener).toHaveBeenCalledWith(
                "beforeunload",
                expect.any(Function)
            );
        });

        it("should set up visibility change handler", () => {
            expect(mockAddEventListener).toHaveBeenCalledWith(
                "visibilitychange",
                expect.any(Function)
            );
        });

        it("should set up online/offline handlers", () => {
            expect(mockAddEventListener).toHaveBeenCalledWith(
                "online",
                expect.any(Function)
            );
            expect(mockAddEventListener).toHaveBeenCalledWith(
                "offline",
                expect.any(Function)
            );
        });
    });

    describe("Cross-Session Persistence", () => {
        it("should persist data across sessions", async () => {
            const testData = {
                ...DEFAULT_CV_DATA,
                [SECTIONS.PERSONAL_INFO]: {
                    ...DEFAULT_CV_DATA[SECTIONS.PERSONAL_INFO],
                    name: "Test User",
                    email: "test@example.com",
                },
            };

            // Save data in "first session"
            await storageManager.saveData(testData);

            // Simulate new session by creating new storage manager instance
            const newStorageManager = new storageManager.constructor();
            const loadResult = await newStorageManager.loadData();

            expect(loadResult.data).toEqual(testData);
            expect(loadResult.recovered).toBe(false);
        });

        it("should maintain metadata across sessions", async () => {
            await storageManager.saveData(DEFAULT_CV_DATA);

            // Create new instance to simulate new session
            const newStorageManager = new storageManager.constructor();
            const stats = newStorageManager.getStorageStats();

            expect(stats.saveCount).toBeGreaterThan(0);
            expect(stats.version).toBeDefined();
        });
    });
});
