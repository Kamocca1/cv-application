import React, { useState, useCallback, useEffect } from "react";
import CVBuilder from "./components/CVBuilder.jsx";
import "./App.css";

/**
 * Main App Component - Root component of the CV Builder application
 *
 * Responsibilities:
 * - Provides global layout structure
 * - Manages application-level state and configuration
 * - Handles top-level error boundaries and loading states
 * - Coordinates between CVBuilder and any future routing/navigation
 */
function App() {
    // Debug: Add console log to see if App component is rendering
    console.log("App component is rendering");
    // Application-level state
    const [appConfig] = useState({
        autoSave: true,
        autoSaveDelay: 2000,
        theme: "light", // Future enhancement for theme switching
    });

    // Track application status
    const [appStatus, setAppStatus] = useState({
        isOnline: navigator.onLine,
        lastActivity: new Date(),
    });

    /**
     * Handle CV data changes from CVBuilder
     * This provides a centralized point for handling data updates
     * and can be extended for analytics, backup, etc.
     */
    const handleDataChange = useCallback((data) => {
        // Update last activity timestamp
        setAppStatus((prev) => ({
            ...prev,
            lastActivity: new Date(),
        }));

        // Log data changes for debugging (can be removed in production)
        console.log("CV data updated:", data);

        // Future: Could add analytics tracking, cloud sync, etc.
    }, []);

    /**
     * Handle application configuration changes
     */

    /**
     * Monitor online/offline status for better UX
     */
    useEffect(() => {
        const handleOnline = () =>
            setAppStatus((prev) => ({ ...prev, isOnline: true }));
        const handleOffline = () =>
            setAppStatus((prev) => ({ ...prev, isOnline: false }));

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <div className="app" data-theme={appConfig.theme}>
            {/* Application Header - Future enhancement */}
            <header className="app-header">
                <div className="app-header-content">
                    <h1 className="app-title">Professional CV Builder</h1>

                    {/* Connection status indicator */}
                    <div className="app-status">
                        <span
                            className={`status-indicator ${
                                appStatus.isOnline ? "online" : "offline"
                            }`}
                            title={
                                appStatus.isOnline
                                    ? "Online"
                                    : "Offline - Changes saved locally"
                            }
                        >
                            {appStatus.isOnline ? "🟢" : "🔴"}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Application Content */}
            <main className="app-main">
                <CVBuilder
                    onDataChange={handleDataChange}
                    autoSave={appConfig.autoSave}
                    autoSaveDelay={appConfig.autoSaveDelay}
                    className="cv-builder-main"
                />
            </main>

            {/* Application Footer */}
            <footer className="app-footer">
                <div className="app-footer-content">
                    <p className="app-footer-text">
                        Built with React • Data stored locally in your browser
                    </p>
                    <p className="app-footer-version">Version 1.0.0</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
