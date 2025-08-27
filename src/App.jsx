import React, { useCallback, useState, useEffect } from "react";
import CVBuilder from "./components/CVBuilder.jsx";
import "./App.css";

/**
 * Main App Component - Root component of the CV Builder application
 */
function App() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [theme, setTheme] = useState("light");

    // Handle online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Handle theme detection
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleThemeChange = (e) => {
            setTheme(e.matches ? "dark" : "light");
        };

        setTheme(mediaQuery.matches ? "dark" : "light");
        mediaQuery.addEventListener("change", handleThemeChange);

        return () => {
            mediaQuery.removeEventListener("change", handleThemeChange);
        };
    }, []);

    /**
     * Handle CV data changes from CVBuilder
     */
    const handleDataChange = useCallback((data) => {
        // Only log in development
        if (process.env.NODE_ENV === "development") {
            console.log("CV data updated:", data);
        }
    }, []);

    return (
        <div className="app">
            {/* Application Header */}
            <header className="app-header">
                <div className="app-header-content">
                    <h1 className="app-title">Professional CV Builder</h1>
                </div>
            </header>

            {/* Main Application Content */}
            <main className="app-main">
                <CVBuilder
                    onDataChange={handleDataChange}
                    className="cv-builder-main"
                />
            </main>

            {/* Application Footer */}
            <footer className="app-footer">
                <div className="app-footer-content">
                    <p className="app-footer-text">
                        Built with React • Simple CV Builder
                    </p>
                    <p className="app-footer-version">Version 1.0.0</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
