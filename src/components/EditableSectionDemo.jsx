import React, { useState } from "react";
import EditableSection from "./EditableSection.jsx";
import { TextInput, TextArea } from "./index.js";
import {
    validateName,
    validateEmail,
    validateText,
} from "../utils/validation.js";

/**
 * Demo component to showcase EditableSection functionality
 */
const EditableSectionDemo = () => {
    const [personalInfo, setPersonalInfo] = useState({
        name: "John Doe",
        email: "john@example.com",
        bio: "Software developer with 5 years of experience.",
    });

    const validationRules = {
        name: validateName,
        email: validateEmail,
        bio: (value) => validateText(value, 10, 200),
    };

    const handleSave = async (data) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPersonalInfo(data);
        console.log("Saved data:", data);
    };

    const handleCancel = () => {
        console.log("Edit cancelled");
    };

    return (
        <div
            style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem" }}
        >
            <h1>EditableSection Demo</h1>

            <EditableSection
                sectionId="personal-info"
                title="Personal Information"
                icon="👤"
                data={personalInfo}
                onSave={handleSave}
                onCancel={handleCancel}
                validationRules={validationRules}
                autoSave={false}
            >
                {({ isEditing, data, onFieldChange, validationErrors }) => (
                    <div>
                        {isEditing ? (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                }}
                            >
                                <TextInput
                                    label="Full Name"
                                    value={data.name}
                                    onChange={(value) =>
                                        onFieldChange("name", value)
                                    }
                                    required
                                    error={validationErrors.name}
                                />
                                <TextInput
                                    label="Email Address"
                                    type="email"
                                    value={data.email}
                                    onChange={(value) =>
                                        onFieldChange("email", value)
                                    }
                                    required
                                    error={validationErrors.email}
                                />
                                <TextArea
                                    label="Bio"
                                    value={data.bio}
                                    onChange={(value) =>
                                        onFieldChange("bio", value)
                                    }
                                    rows={4}
                                    maxLength={200}
                                    error={validationErrors.bio}
                                />
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                }}
                            >
                                <div>
                                    <strong>Name:</strong> {data.name}
                                </div>
                                <div>
                                    <strong>Email:</strong> {data.email}
                                </div>
                                <div>
                                    <strong>Bio:</strong> {data.bio}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </EditableSection>

            <div
                style={{
                    marginTop: "2rem",
                    padding: "1rem",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                }}
            >
                <h3>Features Demonstrated:</h3>
                <ul>
                    <li>✅ Edit/Display mode switching</li>
                    <li>✅ Form validation with error display</li>
                    <li>✅ Edit, Save, and Cancel buttons</li>
                    <li>✅ Local state management during editing</li>
                    <li>✅ Loading states during save operations</li>
                    <li>✅ Status indicators (Ready/Editing/Saved)</li>
                    <li>✅ Validation error summary</li>
                    <li>
                        ✅ Accessibility features (ARIA labels, keyboard
                        navigation)
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default EditableSectionDemo;
