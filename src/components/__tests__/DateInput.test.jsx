import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DateInput from "../DateInput.jsx";

describe("DateInput Component", () => {
    const defaultProps = {
        label: "Test Date",
        value: "",
        onChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with required props", () => {
        render(<DateInput {...defaultProps} />);

        expect(screen.getByLabelText("Test Date")).toBeInTheDocument();
        expect(screen.getByLabelText("Test Date")).toHaveAttribute(
            "type",
            "date"
        );
    });

    it("displays the correct label", () => {
        render(<DateInput {...defaultProps} label="Start Date" />);

        expect(screen.getByText("Start Date")).toBeInTheDocument();
        expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
    });

    it("shows current value in date input", () => {
        render(<DateInput {...defaultProps} value="2023-12-25" />);

        expect(screen.getByDisplayValue("2023-12-25")).toBeInTheDocument();
    });

    it("has correct input type", () => {
        render(<DateInput {...defaultProps} />);

        const input = screen.getByLabelText("Test Date");
        expect(input).toHaveAttribute("type", "date");
    });

    it("calls onChange when date is selected", async () => {
        const user = userEvent.setup();
        const mockOnChange = vi.fn();

        render(<DateInput {...defaultProps} onChange={mockOnChange} />);

        const input = screen.getByLabelText("Test Date");
        await user.type(input, "2023-12-25");

        expect(mockOnChange).toHaveBeenCalledWith("2023-12-25");
    });

    it("shows required indicator when required is true", () => {
        render(<DateInput {...defaultProps} required />);

        expect(screen.getByText("*")).toBeInTheDocument();
        expect(screen.getByLabelText("required")).toBeInTheDocument();
    });

    it("does not show required indicator when required is false", () => {
        render(<DateInput {...defaultProps} required={false} />);

        expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("displays error message when error prop is provided", () => {
        const errorMessage = "Invalid date";
        render(<DateInput {...defaultProps} error={errorMessage} />);

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("sets aria-invalid when error is present", () => {
        render(<DateInput {...defaultProps} error="Error message" />);

        const input = screen.getByLabelText("Test Date");
        expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("does not set aria-invalid when no error", () => {
        render(<DateInput {...defaultProps} />);

        const input = screen.getByLabelText("Test Date");
        expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("associates error message with input using aria-describedby", () => {
        render(<DateInput {...defaultProps} error="Error message" />);

        const input = screen.getByLabelText("Test Date");
        const errorElement = screen.getByRole("alert");

        expect(input).toHaveAttribute("aria-describedby", errorElement.id);
    });

    it("can be disabled", () => {
        render(<DateInput {...defaultProps} disabled />);

        const input = screen.getByLabelText("Test Date");
        expect(input).toBeDisabled();
    });

    it("sets min date when provided", () => {
        render(<DateInput {...defaultProps} min="2020-01-01" />);

        const input = screen.getByLabelText("Test Date");
        expect(input).toHaveAttribute("min", "2020-01-01");
    });

    it("sets max date when provided", () => {
        render(<DateInput {...defaultProps} max="2025-12-31" />);

        const input = screen.getByLabelText("Test Date");
        expect(input).toHaveAttribute("max", "2025-12-31");
    });

    it("generates unique id based on label", () => {
        render(<DateInput {...defaultProps} label="Birth Date" />);

        const input = screen.getByLabelText("Birth Date");
        expect(input).toHaveAttribute("id", "date-input-birth-date");
    });

    it("uses custom id when provided", () => {
        render(<DateInput {...defaultProps} id="custom-date-id" />);

        const input = screen.getByLabelText("Test Date");
        expect(input).toHaveAttribute("id", "custom-date-id");
    });

    it("applies custom className", () => {
        render(<DateInput {...defaultProps} className="custom-date-class" />);

        const container = screen.getByLabelText("Test Date").closest("div");
        expect(container).toHaveClass("custom-date-class");
    });

    it("formats date value correctly", () => {
        // Test with already formatted date
        const { rerender } = render(
            <DateInput {...defaultProps} value="2023-12-25" />
        );
        expect(screen.getByDisplayValue("2023-12-25")).toBeInTheDocument();

        // Test with empty value
        rerender(<DateInput {...defaultProps} value="" />);
        expect(screen.getByLabelText("Test Date")).toHaveValue("");
    });

    it("handles invalid date values gracefully", () => {
        render(<DateInput {...defaultProps} value="invalid-date" />);

        // Should render empty value for invalid dates
        expect(screen.getByLabelText("Test Date")).toHaveValue("");
    });

    it("passes through additional props to input element", () => {
        render(<DateInput {...defaultProps} data-testid="custom-date-input" />);

        const input = screen.getByLabelText("Test Date");
        expect(input).toHaveAttribute("data-testid", "custom-date-input");
    });

    it("supports focus and blur events", async () => {
        const user = userEvent.setup();
        render(<DateInput {...defaultProps} />);

        const input = screen.getByLabelText("Test Date");

        await user.click(input);
        expect(input).toHaveFocus();

        await user.tab();
        expect(input).not.toHaveFocus();
    });

    it("handles date formatting edge cases", () => {
        // Test with Date object (should not happen in normal usage but good to test)
        const { rerender } = render(
            <DateInput {...defaultProps} value="2023-01-01" />
        );
        expect(screen.getByDisplayValue("2023-01-01")).toBeInTheDocument();

        // Test with null/undefined
        rerender(<DateInput {...defaultProps} value={null} />);
        expect(screen.getByLabelText("Test Date")).toHaveValue("");

        rerender(<DateInput {...defaultProps} value={undefined} />);
        expect(screen.getByLabelText("Test Date")).toHaveValue("");
    });
});
