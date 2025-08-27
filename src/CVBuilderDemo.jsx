import React from "react";
import CVBuilder from "./components/CVBuilder.jsx";

/**
 * Demo component to test CVBuilder integration
 */
const CVBuilderDemo = () => {
    const handleDataChange = (data) => {
        console.log("CV data changed:", data);
    };

    return (
        <div>
            <CVBuilder
                onDataChange={handleDataChange}
                autoSave={true}
                autoSaveDelay={1000}
            />
        </div>
    );
};

export default CVBuilderDemo;
