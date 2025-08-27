import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextArea from "../TextArea.jsx";

describe("TextArea Component", () => {
    const defaultProps = {
        label: "Test Label",
        value: "",
        onChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with required props", () => {
        render(<TextArea {...defaultProps} />);

        expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("displays the correct label", () => {
        render(<TextArea {...defaultProps} label="Job Responsibilities" />);

        expect(screen.getByText("Job Responsibilities")).toBeInTheDocument();
        expect(
            screen.getByLabelText("Job Responsibilities")
        ).toBeInTheDocument();
    });

    it("shows current value in textarea", () => {
        const longText = "This is a long description of job responsibilities";
        render(<TextArea {...defaultProps} value={longText} />);

        expect(screen.getByDisplayValue(longText)).toBeInTheDocument();
    });

    it("calls onChange when user types", async () => {
        const user = userEvent.setup();
        const mockOnChange = vi.fn();

        render(<TextArea {...defaultProps} onChange={mockOnChange} />);

        const textarea = screen.getByRole("textbox");
        await user.type(textarea, "Hello{enter}World");

        expect(mockOnChange).toHaveBeenCalled();
        // Check that onChange was called with individual characters including newline
        expect(mockOnChange).toHaveBeenCalledWith("H");
        expect(mockOnChange).toHaveBeenCalledWith("e");
        expect(mockOnChange).toHaveBeenCalledWith("\n");
        expect(mockOnChange).toHaveBeenCalledWith("W");
    });

    it("displays placeholder text", () => {
        render(
            <TextArea
                {...defaultProps}
                placeholder="Describe your responsibilities"
            />
        );

        expect(
            screen.getByPlaceholderText("Describe your responsibilities")
        ).toBeInTheDocument();
    });

    it("shows required indicator when required is true", () => {
        render(<TextArea {...defaultProps} required />);

        expect(screen.getByText("*")).toBeInTheDocument();
        expect(screen.getByLabelText("required")).toBeInTheDocument();
    });

    it("sets correct number of rows", () => {
        render(<TextArea {...defaultProps} rows={6} />);

        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveAttribute("rows", "6");
    });

    it("uses default rows when not specified", () => {
        render(<TextArea {...defaultProps} />);

        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveAttribute("rows", "4");
    });

    it("displays error message when error prop is provided", () => {
        const errorMessage = "This field is required";
        render(<TextArea {...defaultProps} error={errorMessage} />);

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("sets aria-invalid when error is present", () => {
        render(<TextArea {...defaultProps} error="Error message" />);

        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("associates error message with textarea using aria-describedby", () => {
        render(<TextArea {...defaultProps} error="Error message" />);

        const textarea = screen.getByRole("textbox");
        const errorElement = screen.getByRole("alert");

        expect(textarea).toHaveAttribute("aria-describedby", errorElement.id);
    });

    it("can be disabled", () => {
        render(<TextArea {...defaultProps} disabled />);

        const textarea = screen.getByRole("textbox");
        expect(textarea).toBeDisabled();
    });

    it("displays character count when maxLength is provided", () => {
        render(<TextArea {...defaultProps} value="Hello" maxLength={100} />);

        expect(screen.getByText("5/100")).toBeInTheDocument();
    });

    it("updates character count as user types", async () => {
        const user = userEvent.setup();
        const mockOnChange = vi.fn();

        render(
            <TextArea
                {...defaultProps}
                onChange={mockOnChange}
                maxLength={50}
            />
        );

        // Test with initial value to show character count

        expect(
            screen.getByText((content, element) => {
                return element && element.textContent === "4/50";
            })
        ).toBeInTheDocument();
    });

    it("does not show character count when maxLength is not provided", () => {
        render(<TextArea {...defaultProps} value="Hello" />);

        expect(screen.queryByText(/\/\d+/)).not.toBeInTheDocument();
    });

    it("generates unique id based on label", () => {
        render(<TextArea {...defaultProps} label="Job Description" />);

        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveAttribute("id", "textarea-job-description");
    });

    it("uses custom id when provided", () => {
        render(<TextArea {...defaultProps} id="custom-textarea-id" />);

        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveAttribute("id", "custom-textarea-id");
    });

    it("applies custom className", () => {
        render(
            <TextArea {...defaultProps} className="custom-textarea-class" />
        );

        const container = screen.getByRole("textbox").closest("div");
        expect(container).toHaveClass("custom-textarea-class");
    });

    it("passes through additional props to textarea element", () => {
        render(<TextArea {...defaultProps} maxLength={200} />);

        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveAttribute("maxLength", "200");
    });

    it("handles multiline text correctly", async () => {
        const user = userEvent.setup();
        const mockOnChange = vi.fn();

        render(<TextArea {...defaultProps} onChange={mockOnChange} />);

        const textarea = screen.getByRole("textbox");
        await user.type(textarea, "Line 1{enter}Line 2{enter}Line 3");

        // Check that onChange was called with individual characters including newlines
        expect(mockOnChange).toHaveBeenCalledWith("L");
        expect(mockOnChange).toHaveBeenCalledWith("i");
        expect(mockOnChange).toHaveBeenCalledWith("\n");
        expect(mockOnChange).toHaveBeenCalledWith("3");
    });

    it("supports focus and blur events", async () => {
        const user = userEvent.setup();
        render(<TextArea {...defaultProps} />);

        const textarea = screen.getByRole("textbox");

        await user.click(textarea);
        expect(textarea).toHaveFocus();

        await user.tab();
        expect(textarea).not.toHaveFocus();
    });
});
