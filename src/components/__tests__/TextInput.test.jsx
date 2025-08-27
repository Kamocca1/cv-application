import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextInput from "../TextInput.jsx";

describe("TextInput Component", () => {
    const defaultProps = {
        label: "Test Label",
        value: "",
        onChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders with required props", () => {
        render(<TextInput {...defaultProps} />);

        expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("displays the correct label", () => {
        render(<TextInput {...defaultProps} label="Full Name" />);

        expect(screen.getByText("Full Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    });

    it("shows current value in input field", () => {
        render(<TextInput {...defaultProps} value="John Doe" />);

        expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    });

    it("calls onChange when user types", async () => {
        const user = userEvent.setup();
        const mockOnChange = vi.fn();

        render(<TextInput {...defaultProps} onChange={mockOnChange} />);

        const input = screen.getByRole("textbox");
        await user.type(input, "Hello");

        expect(mockOnChange).toHaveBeenCalledTimes(5); // Once for each character
        // Check that onChange was called with individual characters
        expect(mockOnChange).toHaveBeenCalledWith("H");
        expect(mockOnChange).toHaveBeenCalledWith("e");
        expect(mockOnChange).toHaveBeenCalledWith("l");
        expect(mockOnChange).toHaveBeenCalledWith("o");
    });

    it("displays placeholder text", () => {
        render(<TextInput {...defaultProps} placeholder="Enter your name" />);

        expect(
            screen.getByPlaceholderText("Enter your name")
        ).toBeInTheDocument();
    });

    it("shows required indicator when required is true", () => {
        render(<TextInput {...defaultProps} required />);

        expect(screen.getByText("*")).toBeInTheDocument();
        expect(screen.getByLabelText("required")).toBeInTheDocument();
    });

    it("does not show required indicator when required is false", () => {
        render(<TextInput {...defaultProps} required={false} />);

        expect(screen.queryByText("*")).not.toBeInTheDocument();
    });

    it("sets correct input type", () => {
        render(<TextInput {...defaultProps} type="email" />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("type", "email");
    });

    it("displays error message when error prop is provided", () => {
        const errorMessage = "This field is required";
        render(<TextInput {...defaultProps} error={errorMessage} />);

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("sets aria-invalid when error is present", () => {
        render(<TextInput {...defaultProps} error="Error message" />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("does not set aria-invalid when no error", () => {
        render(<TextInput {...defaultProps} />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("associates error message with input using aria-describedby", () => {
        render(<TextInput {...defaultProps} error="Error message" />);

        const input = screen.getByRole("textbox");
        const errorElement = screen.getByRole("alert");

        expect(input).toHaveAttribute("aria-describedby", errorElement.id);
    });

    it("can be disabled", () => {
        render(<TextInput {...defaultProps} disabled />);

        const input = screen.getByRole("textbox");
        expect(input).toBeDisabled();
    });

    it("generates unique id based on label", () => {
        render(<TextInput {...defaultProps} label="Full Name" />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("id", "text-input-full-name");
    });

    it("uses custom id when provided", () => {
        render(<TextInput {...defaultProps} id="custom-id" />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("id", "custom-id");
    });

    it("applies custom className", () => {
        render(<TextInput {...defaultProps} className="custom-class" />);

        const container = screen.getByRole("textbox").closest("div");
        expect(container).toHaveClass("custom-class");
    });

    it("passes through additional props to input element", () => {
        render(<TextInput {...defaultProps} maxLength={10} />);

        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("maxLength", "10");
    });

    it("handles focus and blur events", async () => {
        const user = userEvent.setup();
        render(<TextInput {...defaultProps} />);

        const input = screen.getByRole("textbox");

        await user.click(input);
        expect(input).toHaveFocus();

        await user.tab();
        expect(input).not.toHaveFocus();
    });

    it("supports different input types", () => {
        const { rerender } = render(
            <TextInput {...defaultProps} type="email" />
        );
        expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

        rerender(<TextInput {...defaultProps} type="tel" />);
        expect(screen.getByRole("textbox")).toHaveAttribute("type", "tel");

        // Password inputs don't have textbox role, so we test them differently
        rerender(<TextInput {...defaultProps} type="password" />);
        expect(screen.getByLabelText("Test Label")).toHaveAttribute(
            "type",
            "password"
        );
    });
});
