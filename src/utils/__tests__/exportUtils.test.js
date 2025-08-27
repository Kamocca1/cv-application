import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportToWord } from "../exportUtils.js";
import {
    DEFAULT_CV_DATA,
    SECTIONS,
    PERSONAL_INFO_FIELDS,
} from "../../models/dataTypes.js";

// Mock DOM methods
Object.defineProperty(global, "URL", {
    value: {
        createObjectURL: vi.fn(() => "mock-url"),
        revokeObjectURL: vi.fn(),
    },
});

Object.defineProperty(global, "Blob", {
    value: vi.fn(() => ({})),
});

// Mock document methods
Object.defineProperty(global, "document", {
    value: {
        createElement: vi.fn(() => ({
            href: "",
            download: "",
            click: vi.fn(),
            style: {},
        })),
        body: {
            appendChild: vi.fn(),
            removeChild: vi.fn(),
        },
    },
});

describe("exportUtils", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("exportToWord", () => {
        it("should export CV data to Word document", async () => {
            const testData = {
                ...DEFAULT_CV_DATA,
                [SECTIONS.PERSONAL_INFO]: {
                    ...DEFAULT_CV_DATA[SECTIONS.PERSONAL_INFO],
                    [PERSONAL_INFO_FIELDS.NAME]: "John Doe",
                    [PERSONAL_INFO_FIELDS.EMAIL]: "john@example.com",
                },
            };

            const result = await exportToWord(testData);

            expect(result.success).toBe(true);
            expect(result.filename).toContain("John_Doe_CV_");
            expect(result.filename).toMatch(/\.doc$/);
        });

        it("should handle empty CV data", async () => {
            const result = await exportToWord(DEFAULT_CV_DATA);

            expect(result.success).toBe(true);
            expect(result.filename).toContain("CV_");
        });
    });
});
