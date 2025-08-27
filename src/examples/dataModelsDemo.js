/**
 * Demonstration of how to use the data models and utilities
 */

import {
    DEFAULT_CV_DATA,
    DEFAULT_PERSONAL_INFO,
    createNewEducationEntry,
    createNewWorkExperienceEntry,
    validateName,
    validateEmail,
    validatePhone,
    sortEducationEntries,
    sortWorkExperienceEntries,
    formatDateRange,
    PERSONAL_INFO_FIELDS,
    EDUCATION_FIELDS,
    WORK_EXPERIENCE_FIELDS,
} from "../models/index.js";

console.log("=== CV Builder Data Models Demo ===\n");

// 1. Create initial CV data structure
console.log("1. Initial CV Data Structure:");
console.log(JSON.stringify(DEFAULT_CV_DATA, null, 2));

// 2. Validate personal information
console.log("\n2. Personal Information Validation:");
const personalInfo = {
    [PERSONAL_INFO_FIELDS.NAME]: "John Doe",
    [PERSONAL_INFO_FIELDS.EMAIL]: "john.doe@example.com",
    [PERSONAL_INFO_FIELDS.PHONE]: "+1-555-123-4567",
};

console.log("Name validation:", validateName(personalInfo.name));
console.log("Email validation:", validateEmail(personalInfo.email));
console.log("Phone validation:", validatePhone(personalInfo.phone));

// 3. Create and manage education entries
console.log("\n3. Education Entries Management:");
const education1 = createNewEducationEntry();
education1[EDUCATION_FIELDS.SCHOOL_NAME] = "University of Technology";
education1[EDUCATION_FIELDS.TITLE_OF_STUDY] = "Computer Science";
education1[EDUCATION_FIELDS.START_DATE] = "2018-09-01";
education1[EDUCATION_FIELDS.END_DATE] = "2022-06-30";

const education2 = createNewEducationEntry();
education2[EDUCATION_FIELDS.SCHOOL_NAME] = "Community College";
education2[EDUCATION_FIELDS.TITLE_OF_STUDY] = "General Studies";
education2[EDUCATION_FIELDS.START_DATE] = "2016-09-01";
education2[EDUCATION_FIELDS.END_DATE] = "2018-05-30";

const educationEntries = [education1, education2];
const sortedEducation = sortEducationEntries(educationEntries);

console.log("Sorted Education (chronological):");
sortedEducation.forEach((entry, index) => {
    console.log(`${index + 1}. ${entry.schoolName} - ${entry.titleOfStudy}`);
    console.log(`   ${formatDateRange(entry.startDate, entry.endDate)}`);
});

// 4. Create and manage work experience entries
console.log("\n4. Work Experience Management:");
const work1 = createNewWorkExperienceEntry();
work1[WORK_EXPERIENCE_FIELDS.COMPANY_NAME] = "Tech Corp";
work1[WORK_EXPERIENCE_FIELDS.POSITION_TITLE] = "Senior Developer";
work1[WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES] =
    "Led development team, implemented new features, mentored junior developers";
work1[WORK_EXPERIENCE_FIELDS.START_DATE] = "2022-07-01";
work1[WORK_EXPERIENCE_FIELDS.IS_CURRENT] = true;

const work2 = createNewWorkExperienceEntry();
work2[WORK_EXPERIENCE_FIELDS.COMPANY_NAME] = "Startup Inc";
work2[WORK_EXPERIENCE_FIELDS.POSITION_TITLE] = "Junior Developer";
work2[WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES] =
    "Developed web applications, fixed bugs, participated in code reviews";
work2[WORK_EXPERIENCE_FIELDS.START_DATE] = "2020-01-01";
work2[WORK_EXPERIENCE_FIELDS.END_DATE] = "2022-06-30";
work2[WORK_EXPERIENCE_FIELDS.IS_CURRENT] = false;

const workEntries = [work2, work1]; // Intentionally unsorted
const sortedWork = sortWorkExperienceEntries(workEntries);

console.log("Sorted Work Experience (reverse chronological):");
sortedWork.forEach((entry, index) => {
    console.log(`${index + 1}. ${entry.positionTitle} at ${entry.companyName}`);
    console.log(
        `   ${formatDateRange(entry.startDate, entry.endDate, entry.isCurrent)}`
    );
    console.log(`   ${entry.responsibilities.substring(0, 50)}...`);
});

// 5. Complete CV data structure
console.log("\n5. Complete CV Data:");
const completeCV = {
    personalInfo: personalInfo,
    education: sortedEducation,
    workExperience: sortedWork,
};

console.log("Personal Info:", completeCV.personalInfo);
console.log("Education Count:", completeCV.education.length);
console.log("Work Experience Count:", completeCV.workExperience.length);

console.log("\n=== Demo Complete ===");
