/**
 * Data structure constants and type definitions for CV Builder
 */

// Personal Information data structure
export const PERSONAL_INFO_FIELDS = {
    NAME: "name",
    EMAIL: "email",
    PHONE: "phone",
};

// Education data structure
export const EDUCATION_FIELDS = {
    ID: "id",
    SCHOOL_NAME: "schoolName",
    TITLE_OF_STUDY: "titleOfStudy",
    START_DATE: "startDate",
    END_DATE: "endDate",
};

// Work Experience data structure
export const WORK_EXPERIENCE_FIELDS = {
    ID: "id",
    COMPANY_NAME: "companyName",
    POSITION_TITLE: "positionTitle",
    RESPONSIBILITIES: "responsibilities",
    START_DATE: "startDate",
    END_DATE: "endDate",
    IS_CURRENT: "isCurrent",
};

// Section identifiers
export const SECTIONS = {
    PERSONAL_INFO: "personalInfo",
    EDUCATION: "education",
    WORK_EXPERIENCE: "workExperience",
};

// Default state objects
export const DEFAULT_PERSONAL_INFO = {
    [PERSONAL_INFO_FIELDS.NAME]: "",
    [PERSONAL_INFO_FIELDS.EMAIL]: "",
    [PERSONAL_INFO_FIELDS.PHONE]: "",
};

export const DEFAULT_EDUCATION_ENTRY = {
    [EDUCATION_FIELDS.ID]: "",
    [EDUCATION_FIELDS.SCHOOL_NAME]: "",
    [EDUCATION_FIELDS.TITLE_OF_STUDY]: "",
    [EDUCATION_FIELDS.START_DATE]: "",
    [EDUCATION_FIELDS.END_DATE]: "",
};

export const DEFAULT_WORK_EXPERIENCE_ENTRY = {
    [WORK_EXPERIENCE_FIELDS.ID]: "",
    [WORK_EXPERIENCE_FIELDS.COMPANY_NAME]: "",
    [WORK_EXPERIENCE_FIELDS.POSITION_TITLE]: "",
    [WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES]: "",
    [WORK_EXPERIENCE_FIELDS.START_DATE]: "",
    [WORK_EXPERIENCE_FIELDS.END_DATE]: "",
    [WORK_EXPERIENCE_FIELDS.IS_CURRENT]: false,
};

// Complete default CV data structure
export const DEFAULT_CV_DATA = {
    [SECTIONS.PERSONAL_INFO]: DEFAULT_PERSONAL_INFO,
    [SECTIONS.EDUCATION]: [],
    [SECTIONS.WORK_EXPERIENCE]: [],
};
