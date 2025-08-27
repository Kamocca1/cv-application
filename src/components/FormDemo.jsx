import React, { useState } from "react";
import { TextInput, TextArea, DateInput } from "./index.js";
import {
    validateName,
    validateEmail,
    validatePhone,
    validateDate,
    validateResponsibilities,
} from "../utils/validation.js";
import cvStyles from "../styles/CVPreview.module.css";

/**
 * Demo component to showcase the form field components
 */
const FormDemo = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        startDate: "",
        responsibilities: "",
    });

    const [errors, setErrors] = useState({});

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: null,
            }));
        }
    };

    const validateField = (field, value) => {
        let error = null;

        switch (field) {
            case "name":
                error = validateName(value);
                break;
            case "email":
                error = validateEmail(value);
                break;
            case "phone":
                error = validatePhone(value);
                break;
            case "startDate":
                error = validateDate(value);
                break;
            case "responsibilities":
                error = validateResponsibilities(value);
                break;
            default:
                break;
        }

        setErrors((prev) => ({
            ...prev,
            [field]: error,
        }));

        return error === null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const fields = [
            "name",
            "email",
            "phone",
            "startDate",
            "responsibilities",
        ];
        let isValid = true;

        fields.forEach((field) => {
            const fieldValid = validateField(field, formData[field]);
            if (!fieldValid) {
                isValid = false;
            }
        });

        if (isValid) {
            alert("Form is valid! Check console for data.");
            console.log("Form Data:", formData);
        }
    };

    return (
        <div
            style={{ maxWidth: "600px", margin: "2rem auto", padding: "2rem" }}
        >
            <h2>Form Components Demo</h2>
            <form onSubmit={handleSubmit}>
                <TextInput
                    label="Full Name"
                    value={formData.name}
                    onChange={(value) => handleFieldChange("name", value)}
                    placeholder="Enter your full name"
                    required
                    error={errors.name}
                />

                <TextInput
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(value) => handleFieldChange("email", value)}
                    placeholder="Enter your email"
                    required
                    error={errors.email}
                />

                <TextInput
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(value) => handleFieldChange("phone", value)}
                    placeholder="Enter your phone number"
                    required
                    error={errors.phone}
                />

                <DateInput
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(value) => handleFieldChange("startDate", value)}
                    required
                    error={errors.startDate}
                />

                <TextArea
                    label="Job Responsibilities"
                    value={formData.responsibilities}
                    onChange={(value) =>
                        handleFieldChange("responsibilities", value)
                    }
                    placeholder="Describe your main responsibilities..."
                    required
                    rows={6}
                    maxLength={2000}
                    error={errors.responsibilities}
                />

                <div style={{ marginTop: "2rem" }}>
                    <button
                        type="submit"
                        style={{
                            padding: "0.75rem 2rem",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                            fontSize: "1rem",
                        }}
                    >
                        Submit Form
                    </button>
                </div>
            </form>

            {/* CV Preview Section */}
            <div className={cvStyles.cvPreview}>
                <h2 className={cvStyles.cvTitle}>CV Preview</h2>

                {/* Personal Information */}
                <div className={cvStyles.section}>
                    <h3 className={cvStyles.sectionTitle}>
                        Personal Information
                    </h3>

                    {formData.name && (
                        <div style={{ marginBottom: "0.5rem" }}>
                            <span className={cvStyles.fieldLabel}>Name:</span>{" "}
                            <span className={cvStyles.fieldValue}>
                                {formData.name}
                            </span>
                        </div>
                    )}

                    {formData.email && (
                        <div style={{ marginBottom: "0.5rem" }}>
                            <span className={cvStyles.fieldLabel}>Email:</span>{" "}
                            <span className={cvStyles.fieldValue}>
                                {formData.email}
                            </span>
                        </div>
                    )}

                    {formData.phone && (
                        <div style={{ marginBottom: "0.5rem" }}>
                            <span className={cvStyles.fieldLabel}>Phone:</span>{" "}
                            <span className={cvStyles.fieldValue}>
                                {formData.phone}
                            </span>
                        </div>
                    )}
                </div>

                {/* Work Experience */}
                {(formData.startDate || formData.responsibilities) && (
                    <div className={cvStyles.section}>
                        <h3 className={cvStyles.sectionTitle}>
                            Work Experience
                        </h3>

                        {formData.startDate && (
                            <div style={{ marginBottom: "0.5rem" }}>
                                <span className={cvStyles.fieldLabel}>
                                    Start Date:
                                </span>{" "}
                                <span className={cvStyles.fieldValue}>
                                    {new Date(
                                        formData.startDate
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                        )}

                        {formData.responsibilities && (
                            <div style={{ marginBottom: "0.5rem" }}>
                                <span className={cvStyles.fieldLabel}>
                                    Responsibilities:
                                </span>
                                <div className={cvStyles.responsibilitiesText}>
                                    {formData.responsibilities}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty state message */}
                {!formData.name &&
                    !formData.email &&
                    !formData.phone &&
                    !formData.startDate &&
                    !formData.responsibilities && (
                        <div className={cvStyles.emptyState}>
                            Fill out the form above to see your CV preview here
                        </div>
                    )}
            </div>

            {/* Debug Data (smaller, less prominent) */}
            <details style={{ marginTop: "2rem" }}>
                <summary
                    style={{
                        color: "#d1d5db",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        marginBottom: "1rem",
                    }}
                >
                    Show Raw Form Data (Debug)
                </summary>
                <div
                    style={{
                        padding: "1rem",
                        backgroundColor: "#1f2937",
                        borderRadius: "0.375rem",
                        border: "1px solid #374151",
                    }}
                >
                    <pre
                        style={{
                            fontSize: "0.75rem",
                            overflow: "auto",
                            color: "#d1d5db",
                            margin: 0,
                        }}
                    >
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                </div>
            </details>
        </div>
    );
};

export default FormDemo;
