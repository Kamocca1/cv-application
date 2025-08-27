# CV Builder Data Models and Utilities

This directory contains the core data models, validation utilities, and helper functions for the CV Builder application.

## Structure

```
src/
├── models/
│   ├── dataTypes.js     # Data structure constants and default objects
│   ├── index.js         # Main export file
│   └── README.md        # This file
├── utils/
│   ├── validation.js    # Form validation utilities
│   ├── dataHelpers.js   # Data manipulation helpers
│   └── __tests__/       # Test files
└── examples/
    └── dataModelsDemo.js # Usage demonstration
```

## Data Types

### Personal Information

-   `name`: String - Full name
-   `email`: String - Email address
-   `phone`: String - Phone number

### Education Entry

-   `id`: String - Unique identifier
-   `schoolName`: String - Name of educational institution
-   `titleOfStudy`: String - Degree or program name
-   `startDate`: String - Start date (YYYY-MM-DD)
-   `endDate`: String - End date (YYYY-MM-DD)

### Work Experience Entry

-   `id`: String - Unique identifier
-   `companyName`: String - Company name
-   `positionTitle`: String - Job title
-   `responsibilities`: String - Job responsibilities (multi-line)
-   `startDate`: String - Start date (YYYY-MM-DD)
-   `endDate`: String - End date (YYYY-MM-DD)
-   `isCurrent`: Boolean - Whether this is current position

## Validation Functions

-   `validateName(name)` - Validates name field (2-100 characters)
-   `validateEmail(email)` - Validates email format
-   `validatePhone(phone)` - Validates phone number format
-   `validateDate(date)` - Validates date format and range
-   `validateDateRange(start, end)` - Validates date ranges
-   `validateText(text, min, max)` - Validates text length
-   `validateResponsibilities(text)` - Validates responsibilities field

## Helper Functions

### Entry Management

-   `createNewEducationEntry()` - Creates new education entry with ID
-   `createNewWorkExperienceEntry()` - Creates new work experience entry with ID
-   `removeEntryById(entries, id)` - Removes entry by ID
-   `updateEntryById(entries, id, data)` - Updates entry by ID
-   `findEntryById(entries, id)` - Finds entry by ID

### Sorting

-   `sortEducationEntries(entries)` - Sorts education chronologically
-   `sortWorkExperienceEntries(entries)` - Sorts work experience (newest first, current jobs first)

### Formatting

-   `formatDate(dateString)` - Formats date for display
-   `formatDateRange(start, end, isCurrent)` - Formats date ranges

### Utilities

-   `generateId()` - Generates unique IDs
-   `hasRequiredFields(obj, fields)` - Checks required fields
-   `deepClone(obj)` - Deep clones objects
-   `isEqual(obj1, obj2)` - Compares objects

## Usage Example

```javascript
import {
    DEFAULT_CV_DATA,
    createNewEducationEntry,
    validateEmail,
    sortEducationEntries,
    formatDateRange,
} from "./models/index.js";

// Create new CV data
const cvData = { ...DEFAULT_CV_DATA };

// Add education entry
const education = createNewEducationEntry();
education.schoolName = "University";
education.titleOfStudy = "Computer Science";
education.startDate = "2020-09-01";
education.endDate = "2024-06-30";

cvData.education.push(education);

// Validate email
const emailError = validateEmail("user@example.com");
if (!emailError) {
    cvData.personalInfo.email = "user@example.com";
}

// Sort and format
cvData.education = sortEducationEntries(cvData.education);
const dateRange = formatDateRange(education.startDate, education.endDate);
```

## Testing

Run the test files to verify functionality:

```bash
node src/utils/__tests__/validation.test.js
node src/utils/__tests__/dataHelpers.test.js
node src/examples/dataModelsDemo.js
```
