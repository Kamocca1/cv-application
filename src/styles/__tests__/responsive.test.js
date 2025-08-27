import { describe, it, expect } from "vitest";

describe("Responsive Design CSS", () => {
    it("should have mobile-first breakpoints defined", () => {
        // Test that CSS custom properties are available
        const root = document.documentElement;

        // Check that breakpoint variables exist in CSS
        const style = getComputedStyle(root);

        // These should be defined in our CSS variables
        expect(style.getPropertyValue("--breakpoint-mobile")).toBeTruthy();
        expect(style.getPropertyValue("--breakpoint-tablet")).toBeTruthy();
        expect(style.getPropertyValue("--breakpoint-desktop")).toBeTruthy();
    });

    it("should have touch-friendly spacing variables", () => {
        const root = document.documentElement;
        const style = getComputedStyle(root);

        // Check that spacing variables exist
        expect(style.getPropertyValue("--spacing-sm")).toBeTruthy();
        expect(style.getPropertyValue("--spacing-md")).toBeTruthy();
        expect(style.getPropertyValue("--spacing-lg")).toBeTruthy();
    });

    it("should have responsive font sizes", () => {
        const root = document.documentElement;
        const style = getComputedStyle(root);

        // Check that font size variables exist
        expect(style.getPropertyValue("--font-size-sm")).toBeTruthy();
        expect(style.getPropertyValue("--font-size-base")).toBeTruthy();
        expect(style.getPropertyValue("--font-size-lg")).toBeTruthy();
    });

    it("should support CSS media queries", () => {
        // Test that media queries are supported
        expect(window.matchMedia).toBeDefined();

        // Test mobile media query
        const mobileQuery = window.matchMedia("(max-width: 767px)");
        expect(mobileQuery).toBeDefined();
        expect(typeof mobileQuery.matches).toBe("boolean");

        // Test tablet media query
        const tabletQuery = window.matchMedia(
            "(min-width: 768px) and (max-width: 1023px)"
        );
        expect(tabletQuery).toBeDefined();
        expect(typeof tabletQuery.matches).toBe("boolean");

        // Test desktop media query
        const desktopQuery = window.matchMedia("(min-width: 1024px)");
        expect(desktopQuery).toBeDefined();
        expect(typeof desktopQuery.matches).toBe("boolean");
    });

    it("should have proper viewport meta tag support", () => {
        // Check that viewport meta tag exists in document head
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        expect(viewportMeta).toBeTruthy();

        if (viewportMeta) {
            const content = viewportMeta.getAttribute("content");
            expect(content).toContain("width=device-width");
            expect(content).toContain("initial-scale=1.0");
        }
    });
});
