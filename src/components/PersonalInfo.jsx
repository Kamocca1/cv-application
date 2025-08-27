import React from "react";
import PropTypes from "prop-types";
import EditableSection from "./EditableSection.jsx";
import TextInput from "./TextInput.jsx";
import {
    DEFAULT_PERSONAL_INFO,
    PERSONAL_INFO_FIELDS,
    SECTIONS,
} from "../models/dataTypes.js";
import {
    validateName,
    validateEmail,
    validatePhone,
} from "../utils/validation.js";
import styles from "../styles/PersonalInfo.module.css";

/**
 * PersonalInfo Component
 * Manages personal information (name, email, phone) with edit/display functionality
 */
const PersonalInfo = ({
    data = DEFAULT_PERSONAL_INFO,
    onUpdate,
    className = "",
    disabled = false,
}) => {
    // Validation rules for personal info fields
    const validationRules = {
        [PERSONAL_INFO_FIELDS.NAME]: validateName,
        [PERSONAL_INFO_FIELDS.EMAIL]: validateEmail,
        [PERSONAL_INFO_FIELDS.PHONE]: validatePhone,
    };

    // Handle save callback
    const handleSave = (personalInfoData) => {
        if (onUpdate) {
            onUpdate(personalInfoData);
        }
    };

    // Render edit form
    const renderEditForm = ({
        data: localData,
        onFieldChange,
        validationErrors,
    }) => (
        <div className={styles.editForm}>
            <div className={styles.formGrid}>
                <TextInput
                    label="Full Name"
                    value={localData[PERSONAL_INFO_FIELDS.NAME]}
                    onChange={(value) =>
                        onFieldChange(PERSONAL_INFO_FIELDS.NAME, value)
                    }
                    placeholder="Enter your full name"
                    required
                    error={validationErrors[PERSONAL_INFO_FIELDS.NAME]}
                    validator={validateName}
                    validateOnBlur={true}
                    validateOnChange={false}
                    className={styles.nameField}
                />

                <TextInput
                    label="Email Address"
                    type="email"
                    value={localData[PERSONAL_INFO_FIELDS.EMAIL]}
                    onChange={(value) =>
                        onFieldChange(PERSONAL_INFO_FIELDS.EMAIL, value)
                    }
                    placeholder="your.email@example.com"
                    required
                    error={validationErrors[PERSONAL_INFO_FIELDS.EMAIL]}
                    validator={validateEmail}
                    validateOnBlur={true}
                    validateOnChange={false}
                    className={styles.emailField}
                />

                <TextInput
                    label="Phone Number"
                    type="tel"
                    value={localData[PERSONAL_INFO_FIELDS.PHONE]}
                    onChange={(value) =>
                        onFieldChange(PERSONAL_INFO_FIELDS.PHONE, value)
                    }
                    placeholder="+1 (555) 123-4567"
                    required
                    error={validationErrors[PERSONAL_INFO_FIELDS.PHONE]}
                    validator={validatePhone}
                    validateOnBlur={true}
                    validateOnChange={false}
                    className={styles.phoneField}
                />
            </div>
        </div>
    );

    // Render display view
    const renderDisplayView = ({ data: localData }) => {
        const hasData =
            localData[PERSONAL_INFO_FIELDS.NAME] ||
            localData[PERSONAL_INFO_FIELDS.EMAIL] ||
            localData[PERSONAL_INFO_FIELDS.PHONE];

        if (!hasData) {
            return (
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>👤</div>
                    <div className={styles.emptyStateText}>
                        No personal information added yet
                    </div>
                    <div className={styles.emptyStateSubtext}>
                        Click "Edit" to add your contact details
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.displayView}>
                <div className={styles.infoGrid}>
                    {localData[PERSONAL_INFO_FIELDS.NAME] && (
                        <div className={styles.nameSection}>
                            <h1 className={styles.name}>
                                {localData[PERSONAL_INFO_FIELDS.NAME]}
                            </h1>
                        </div>
                    )}

                    <div className={styles.contactInfo}>
                        {localData[PERSONAL_INFO_FIELDS.EMAIL] && (
                            <div className={styles.contactItem}>
                                <span className={styles.contactIcon}>📧</span>
                                <a
                                    href={`mailto:${
                                        localData[PERSONAL_INFO_FIELDS.EMAIL]
                                    }`}
                                    className={styles.value}
                                >
                                    {localData[PERSONAL_INFO_FIELDS.EMAIL]}
                                </a>
                            </div>
                        )}

                        {localData[PERSONAL_INFO_FIELDS.PHONE] && (
                            <div className={styles.contactItem}>
                                <span className={styles.contactIcon}>📞</span>
                                <a
                                    href={`tel:${
                                        localData[PERSONAL_INFO_FIELDS.PHONE]
                                    }`}
                                    className={styles.value}
                                >
                                    {localData[PERSONAL_INFO_FIELDS.PHONE]}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`${styles.personalInfo} ${className}`}>
            <EditableSection
                sectionId={SECTIONS.PERSONAL_INFO}
                title="Personal Information"
                icon="👤"
                data={data}
                onSave={handleSave}
                validationRules={validationRules}
                disabled={disabled}
                className={styles.editableSection}
            >
                {({ isEditing, ...props }) =>
                    isEditing ? renderEditForm(props) : renderDisplayView(props)
                }
            </EditableSection>
        </div>
    );
};

PersonalInfo.propTypes = {
    /** Personal information data object */
    data: PropTypes.shape({
        [PERSONAL_INFO_FIELDS.NAME]: PropTypes.string,
        [PERSONAL_INFO_FIELDS.EMAIL]: PropTypes.string,
        [PERSONAL_INFO_FIELDS.PHONE]: PropTypes.string,
    }),
    /** Callback function called when personal info is updated */
    onUpdate: PropTypes.func.isRequired,
    /** Additional CSS class names */
    className: PropTypes.string,
    /** Whether the component is disabled */
    disabled: PropTypes.bool,
};

export default PersonalInfo;
