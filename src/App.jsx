import React from "react";
import CVBuilder from "./components/CVBuilder.jsx";
import "./App.css";

function App() {
    const handleDataChange = (data) => {
        console.log("CV data updated:", data);
    };

    return (
        <div className="app">
            <CVBuilder
                onDataChange={handleDataChange}
                autoSave={true}
                autoSaveDelay={2000}
            />
        </div>
    );
}

export default App;
