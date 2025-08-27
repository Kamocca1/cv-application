/**
 * Utility function to trigger file downloads with fallback methods
 * @param {Blob} blob - The file blob to download
 * @param {string} filename - The desired filename
 */
export const triggerDownload = (blob, filename) => {
    try {
        // Method 1: Create download link (most compatible)
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.style.display = "none";

        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();

        // Clean up after a short delay
        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
        }, 100);

        return true;
    } catch (error) {
        console.error("Download failed:", error);

        // Method 2: Fallback - try to open in new window
        try {
            const url = URL.createObjectURL(blob);
            const newWindow = window.open(url, "_blank");
            if (newWindow) {
                // If window opened, suggest manual save
                setTimeout(() => {
                    alert(`Please save the file manually as: ${filename}`);
                    URL.revokeObjectURL(url);
                }, 1000);
                return true;
            }
        } catch (fallbackError) {
            console.error("Fallback download also failed:", fallbackError);
        }

        return false;
    }
};

/**
 * Check if downloads are supported in the current browser
 */
export const isDownloadSupported = () => {
    try {
        const link = document.createElement("a");
        return typeof link.download !== "undefined";
    } catch (error) {
        return false;
    }
};
