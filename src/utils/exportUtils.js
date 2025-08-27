import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { triggerDownload, isDownloadSupported } from "./downloadHelper.js";
import {
    SECTIONS,
    PERSONAL_INFO_FIELDS,
    EDUCATION_FIELDS,
    WORK_EXPERIENCE_FIELDS,
} from "../models/dataTypes.js";

/**
 * Export CV as PDF using html2canvas and jsPDF
 * @param {Object} cvData - The CV data object
 * @param {HTMLElement} previewElement - The CV preview DOM element to capture
 */
export const exportToPDF = async (cvData, previewElement) => {
    try {
        console.log("Starting PDF export...");

        if (!previewElement) {
            throw new Error("Preview element not found");
        }

        // Create a temporary container with better styling for PDF
        const tempContainer = document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.left = "-9999px";
        tempContainer.style.top = "0";
        tempContainer.style.width = "210mm"; // A4 width
        tempContainer.style.backgroundColor = "white";
        tempContainer.style.padding = "20mm";
        tempContainer.style.fontFamily = "Arial, sans-serif";
        tempContainer.style.fontSize = "12px";
        tempContainer.style.lineHeight = "1.4";

        // Clone the preview content
        const clonedContent = previewElement.cloneNode(true);
        tempContainer.appendChild(clonedContent);
        document.body.appendChild(tempContainer);

        console.log("Generating canvas...");

        // Generate canvas from the temporary container
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            width: 794, // A4 width in pixels at 96 DPI
            height: 1123, // A4 height in pixels at 96 DPI
        });

        // Remove temporary container
        document.body.removeChild(tempContainer);

        console.log("Creating PDF...");

        // Create PDF
        const pdf = new jsPDF("p", "mm", "a4");
        const imgData = canvas.toDataURL("image/png");

        // Calculate dimensions to fit A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; // 10mm margin on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add image to PDF
        pdf.addImage(
            imgData,
            "PNG",
            10,
            10,
            imgWidth,
            Math.min(imgHeight, pdfHeight - 20)
        );

        // Generate filename
        const personalInfo = cvData[SECTIONS.PERSONAL_INFO];
        const name = personalInfo[PERSONAL_INFO_FIELDS.NAME] || "CV";
        const filename = `${name.replace(/[^a-zA-Z0-9]/g, "_")}_CV_${
            new Date().toISOString().split("T")[0]
        }.pdf`;

        console.log("Saving PDF:", filename);

        // Check if downloads are supported
        if (!isDownloadSupported()) {
            throw new Error("File downloads are not supported in this browser");
        }

        // Save the PDF - this should trigger download
        pdf.save(filename);

        console.log("PDF export completed successfully");
        return { success: true, filename };
    } catch (error) {
        console.error("PDF export failed:", error);
        throw new Error("Failed to export PDF: " + error.message);
    }
};

/**
 * Export CV as Word document using HTML format (compatible with Word)
 * @param {Object} cvData - The CV data object
 */
export const exportToWord = async (cvData) => {
    try {
        const personalInfo = cvData[SECTIONS.PERSONAL_INFO];
        const education = cvData[SECTIONS.EDUCATION];
        const workExperience = cvData[SECTIONS.WORK_EXPERIENCE];

        // Create HTML content that Word can open
        let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CV</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.4;
            margin: 1in;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .name {
            font-size: 24pt;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #2c3e50;
            text-transform: uppercase;
        }
        .contact-info {
            font-size: 11pt;
            color: #555;
            margin-bottom: 10px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #2c3e50;
            text-transform: uppercase;
            margin: 0 0 15px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid #bdc3c7;
        }
        .summary {
            font-size: 11pt;
            line-height: 1.6;
            text-align: justify;
        }
        .experience-item, .education-item {
            margin-bottom: 20px;
        }
        .job-title, .degree {
            font-size: 12pt;
            font-weight: bold;
            color: #2c3e50;
            margin: 0;
        }
        .company, .school {
            font-size: 11pt;
            color: #555;
            font-weight: 500;
            margin: 5px 0;
        }
        .dates {
            font-size: 10pt;
            color: #7f8c8d;
            font-style: italic;
            float: right;
        }
        .description {
            font-size: 11pt;
            line-height: 1.5;
            text-align: justify;
            margin-top: 8px;
        }
        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }
    </style>
</head>
<body>`;

        // Header - Name and Contact
        htmlContent += `
    <div class="header">
        <h1 class="name">${
            personalInfo[PERSONAL_INFO_FIELDS.NAME] || "Your Name"
        }</h1>`;

        const contactInfo = [];
        if (personalInfo[PERSONAL_INFO_FIELDS.EMAIL]) {
            contactInfo.push(`📧 ${personalInfo[PERSONAL_INFO_FIELDS.EMAIL]}`);
        }
        if (personalInfo[PERSONAL_INFO_FIELDS.PHONE]) {
            contactInfo.push(`📞 ${personalInfo[PERSONAL_INFO_FIELDS.PHONE]}`);
        }

        if (contactInfo.length > 0) {
            htmlContent += `
        <div class="contact-info">${contactInfo.join(" | ")}</div>`;
        }

        htmlContent += `
    </div>`;

        // Professional Summary
        if (personalInfo.summary) {
            htmlContent += `
    <div class="section">
        <h2 class="section-title">Professional Summary</h2>
        <p class="summary">${personalInfo.summary}</p>
    </div>`;
        }

        // Work Experience
        if (workExperience.length > 0) {
            htmlContent += `
    <div class="section">
        <h2 class="section-title">Work Experience</h2>`;

            workExperience.forEach((job) => {
                const jobTitle =
                    job[WORK_EXPERIENCE_FIELDS.POSITION_TITLE] || "Position";
                const dates = job[WORK_EXPERIENCE_FIELDS.IS_CURRENT]
                    ? `${job[WORK_EXPERIENCE_FIELDS.START_DATE]} - Present`
                    : job[WORK_EXPERIENCE_FIELDS.START_DATE] &&
                      job[WORK_EXPERIENCE_FIELDS.END_DATE]
                    ? `${job[WORK_EXPERIENCE_FIELDS.START_DATE]} - ${
                          job[WORK_EXPERIENCE_FIELDS.END_DATE]
                      }`
                    : job[WORK_EXPERIENCE_FIELDS.START_DATE] || "Date";

                htmlContent += `
        <div class="experience-item clearfix">
            <h3 class="job-title">${jobTitle}</h3>
            <span class="dates">${dates}</span>`;

                if (job[WORK_EXPERIENCE_FIELDS.COMPANY_NAME]) {
                    htmlContent += `
            <div class="company">${
                job[WORK_EXPERIENCE_FIELDS.COMPANY_NAME]
            }</div>`;
                }

                if (job[WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES]) {
                    htmlContent += `
            <p class="description">${
                job[WORK_EXPERIENCE_FIELDS.RESPONSIBILITIES]
            }</p>`;
                }

                htmlContent += `
        </div>`;
            });

            htmlContent += `
    </div>`;
        }

        // Education
        if (education.length > 0) {
            htmlContent += `
    <div class="section">
        <h2 class="section-title">Education</h2>`;

            education.forEach((edu) => {
                const degree = edu[EDUCATION_FIELDS.TITLE_OF_STUDY] || "Degree";
                const dates =
                    edu[EDUCATION_FIELDS.START_DATE] &&
                    edu[EDUCATION_FIELDS.END_DATE]
                        ? `${edu[EDUCATION_FIELDS.START_DATE]} - ${
                              edu[EDUCATION_FIELDS.END_DATE]
                          }`
                        : edu[EDUCATION_FIELDS.END_DATE] || "Date";

                htmlContent += `
        <div class="education-item clearfix">
            <h3 class="degree">${degree}</h3>
            <span class="dates">${dates}</span>`;

                if (edu[EDUCATION_FIELDS.SCHOOL_NAME]) {
                    htmlContent += `
            <div class="school">${edu[EDUCATION_FIELDS.SCHOOL_NAME]}</div>`;
                }

                htmlContent += `
        </div>`;
            });

            htmlContent += `
    </div>`;
        }

        htmlContent += `
</body>
</html>`;

        console.log("Creating Word document...");

        // Create and download the file
        const blob = new Blob([htmlContent], {
            type: "application/msword",
        });
        const url = URL.createObjectURL(blob);

        const name = personalInfo[PERSONAL_INFO_FIELDS.NAME] || "CV";
        const filename = `${name.replace(/[^a-zA-Z0-9]/g, "_")}_CV_${
            new Date().toISOString().split("T")[0]
        }.doc`;

        console.log("Downloading Word document:", filename);

        // Use the robust download helper
        const downloadSuccess = triggerDownload(blob, filename);

        if (!downloadSuccess) {
            throw new Error("Failed to trigger file download");
        }

        console.log("Word export completed successfully");
        return { success: true, filename };
    } catch (error) {
        console.error("Word export failed:", error);
        throw new Error("Failed to export Word document: " + error.message);
    }
};
