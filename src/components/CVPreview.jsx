import React from "react";
import PropTypes from "prop-types";
import {
    SECTIONS,
    PERSONAL_INFO_FIELDS,
    EDUCATION_FIELDS,
    WORK_EXPERIENCE_FIELDS,
} from "../models/dataTypes.js";
import styles from "../styles/CVPreview.module.css";

/**
 * CVPreview Component
 * Displays a live preview of the CV in a formatted layout
 */
const CVPreview = ({ cvData }) => {
    const personalInfo = cvData[SECTIONS.PERSONAL_INFO];
    const education = cvData[SECTIONS.EDUCATION];
    const workExperience = cvData[SECTIONS.WORK_EXPERIENCE];

    return (
        <div className={styles.cvPreview}>
            <div className={`${styles.cvDocument} cv-document-export`}>
                {/* Header Section */}
                <div className={styles.header}>
                    <h1 className={styles.name}>
                        {personalInfo[PERSONAL_INFO_FIELDS.NAME] || "Your Name"}
                    </h1>
                    <div className={styles.contactInfo}>
                        {personalInfo[PERSONAL_INFO_FIELDS.EMAIL] && (
                            <span className={styles.contactItem}>
                                📧 {personalInfo[PERSONAL_INFO_FIELDS.EMAIL]}
                            </span>
                        )}
                        {personalInfo[PERSONAL_INFO_FIELDS.PHONE] && (
                            <span className={styles.contactItem}>
                                📞 {personalInfo[PERSONAL_INFO_FIELDS.PHONE]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Professional Summary */}
                {personalInfo.summary && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            Professional Summary
                        </h2>
                        <p className={styles.summary}>{personalInfo.summary}</p>
                    </div>
                )}

                {/* Work Experience */}
                {workExperience.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Work Experience</h2>
                        {workExperience.map((job, index) => (
                            <div key={index} className={styles.experienceItem}>
                                <div className={styles.experienceHeader}>
                                    <h3 className={styles.jobTitle}>
                                        {job[
                                            WORK_EXPERIENCE_FIELDS
                                                .POSITION_TITLE
                                        ] || "Position"}
                                    </h3>
                                    <span className={styles.dates}>
                                        {job[WORK_EXPERIENCE_FIELDS.IS_CURRENT]
                                            ? `${
                                                  job[
                                                      WORK_EXPERIENCE_FIELDS
                                                          .START_DATE
                                                  ]
                                              } - Present`
                                            : job[
                                                  WORK_EXPERIENCE_FIELDS
                                                      .START_DATE
                                              ] &&
                                              job[
                                                  WORK_EXPERIENCE_FIELDS
                                                      .END_DATE
                                              ]
                                            ? `${
                                                  job[
                                                      WORK_EXPERIENCE_FIELDS
                                                          .START_DATE
                                                  ]
                                              } - ${
                                                  job[
                                                      WORK_EXPERIENCE_FIELDS
                                                          .END_DATE
                                                  ]
                                              }`
                                            : job[
                                                  WORK_EXPERIENCE_FIELDS
                                                      .START_DATE
                                              ] || "Date"}
                                    </span>
                                </div>
                                <div className={styles.company}>
                                    {job[WORK_EXPERIENCE_FIELDS.COMPANY_NAME] ||
                                        "Company"}
                                </div>
                                {job[
                                    WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES
                                ] && (
                                    <p className={styles.description}>
                                        {
                                            job[
                                                WORK_EXPERIENCE_FIELDS
                                                    .RESPONSIBILITIES
                                            ]
                                        }
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Education</h2>
                        {education.map((edu, index) => (
                            <div key={index} className={styles.educationItem}>
                                <div className={styles.educationHeader}>
                                    <h3 className={styles.degree}>
                                        {edu[EDUCATION_FIELDS.TITLE_OF_STUDY] ||
                                            "Degree"}
                                    </h3>
                                    <span className={styles.dates}>
                                        {edu[EDUCATION_FIELDS.START_DATE] &&
                                        edu[EDUCATION_FIELDS.END_DATE]
                                            ? `${
                                                  edu[
                                                      EDUCATION_FIELDS
                                                          .START_DATE
                                                  ]
                                              } - ${
                                                  edu[EDUCATION_FIELDS.END_DATE]
                                              }`
                                            : edu[EDUCATION_FIELDS.END_DATE] ||
                                              "Date"}
                                    </span>
                                </div>
                                <div className={styles.school}>
                                    {edu[EDUCATION_FIELDS.SCHOOL_NAME] ||
                                        "School"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!personalInfo[PERSONAL_INFO_FIELDS.NAME] &&
                    education.length === 0 &&
                    workExperience.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>
                                Start filling out the form on the left to see
                                your CV preview here.
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
};

CVPreview.propTypes = {
    /** CV data object containing all sections */
    cvData: PropTypes.object.isRequired,
};

export default CVPreview;
