/**
 * Tests for data helper utilities
 */

import {
    generateId,
    createNewEducationEntry,
    createNewWorkExperienceEntry,
    sortEducationEntries,
    sortWorkExperienceEntries,
    removeEntryById,
    updateEntryById,
    findEntryById,
    formatDate,
    formatDateRange,
    hasRequiredFields,
    deepClone,
    isEqual,
} from "../dataHelpers.js";

import {
    EDUCATION_FIELDS,
    WORK_EXPERIENCE_FIELDS,
} from "../../models/dataTypes.js";

// Test generateId
console.log("Testing generateId...");
const id1 = generateId();
const id2 = generateId();
console.assert(typeof id1 === "string", "ID should be a string");
console.assert(id1 !== id2, "IDs should be unique");

// Test createNewEducationEntry
console.log("Testing createNewEducationEntry...");
const newEducation = createNewEducationEntry();
console.assert(
    typeof newEducation[EDUCATION_FIELDS.ID] === "string",
    "Education entry should have ID"
);
console.assert(
    newEducation[EDUCATION_FIELDS.SCHOOL_NAME] === "",
    "School name should be empty by default"
);

// Test createNewWorkExperienceEntry
console.log("Testing createNewWorkExperienceEntry...");
const newWorkExp = createNewWorkExperienceEntry();
console.assert(
    typeof newWorkExp[WORK_EXPERIENCE_FIELDS.ID] === "string",
    "Work experience entry should have ID"
);
console.assert(
    newWorkExp[WORK_EXPERIENCE_FIELDS.IS_CURRENT] === false,
    "Is current should be false by default"
);

// Test sortEducationEntries
console.log("Testing sortEducationEntries...");
const educationEntries = [
    { id: "1", startDate: "2020-01-01", schoolName: "University B" },
    { id: "2", startDate: "2018-01-01", schoolName: "University A" },
    { id: "3", startDate: "2022-01-01", schoolName: "University C" },
];
const sortedEducation = sortEducationEntries(educationEntries);
console.assert(
    sortedEducation[0].schoolName === "University A",
    "First entry should be oldest"
);
console.assert(
    sortedEducation[2].schoolName === "University C",
    "Last entry should be newest"
);

// Test sortWorkExperienceEntries
console.log("Testing sortWorkExperienceEntries...");
const workEntries = [
    {
        id: "1",
        startDate: "2020-01-01",
        companyName: "Company B",
        isCurrent: false,
    },
    {
        id: "2",
        startDate: "2022-01-01",
        companyName: "Company C",
        isCurrent: true,
    },
    {
        id: "3",
        startDate: "2018-01-01",
        companyName: "Company A",
        isCurrent: false,
    },
];
const sortedWork = sortWorkExperienceEntries(workEntries);
console.assert(
    sortedWork[0].companyName === "Company C",
    "Current job should be first"
);
console.assert(
    sortedWork[1].companyName === "Company B",
    "Most recent non-current should be second"
);

// Test removeEntryById
console.log("Testing removeEntryById...");
const entries = [{ id: "1" }, { id: "2" }, { id: "3" }];
const filtered = removeEntryById(entries, "2");
console.assert(filtered.length === 2, "Should remove one entry");
console.assert(
    !filtered.find((e) => e.id === "2"),
    "Should not contain removed entry"
);

// Test updateEntryById
console.log("Testing updateEntryById...");
const updated = updateEntryById(entries, "2", { name: "Updated" });
const updatedEntry = updated.find((e) => e.id === "2");
console.assert(updatedEntry.name === "Updated", "Should update the entry");

// Test findEntryById
console.log("Testing findEntryById...");
const found = findEntryById(entries, "2");
console.assert(found.id === "2", "Should find the correct entry");
console.assert(
    findEntryById(entries, "999") === null,
    "Should return null for non-existent entry"
);

// Test formatDate
console.log("Testing formatDate...");
const formatted = formatDate("2023-01-15");
console.assert(
    formatted.includes("January"),
    "Should format date with month name"
);
console.assert(formatted.includes("2023"), "Should include year");

// Test formatDateRange
console.log("Testing formatDateRange...");
const range = formatDateRange("2020-01-01", "2021-12-31");
console.assert(range.includes("January 2020"), "Should include start date");
console.assert(range.includes("December 2021"), "Should include end date");

const currentRange = formatDateRange("2020-01-01", "", true);
console.assert(
    currentRange.includes("Present"),
    "Should show Present for current positions"
);

// Test hasRequiredFields
console.log("Testing hasRequiredFields...");
const obj = { name: "John", email: "john@example.com", phone: "" };
console.assert(
    hasRequiredFields(obj, ["name", "email"]) === true,
    "Should pass with required fields"
);
console.assert(
    hasRequiredFields(obj, ["name", "phone"]) === false,
    "Should fail with empty required field"
);

// Test deepClone
console.log("Testing deepClone...");
const original = { a: 1, b: { c: 2 } };
const cloned = deepClone(original);
cloned.b.c = 3;
console.assert(original.b.c === 2, "Original should not be modified");
console.assert(cloned.b.c === 3, "Clone should be modified");

// Test isEqual
console.log("Testing isEqual...");
const obj1 = { a: 1, b: 2 };
const obj2 = { a: 1, b: 2 };
const obj3 = { a: 1, b: 3 };
console.assert(
    isEqual(obj1, obj2) === true,
    "Equal objects should return true"
);
console.assert(
    isEqual(obj1, obj3) === false,
    "Different objects should return false"
);

console.log("All data helper tests passed!");
