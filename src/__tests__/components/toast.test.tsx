import { describe, it, expect } from "@jest/globals";
import { render } from "@testing-library/react-native";

import { Toast } from "@/src/components/shared/toast";

describe("Toast", () => {
  it("renders message when visible", () => {
    const { getByText } = render(
      <Toast message="Saved successfully" visible onDismiss={() => {}} />
    );
    expect(getByText("Saved successfully")).toBeTruthy();
  });

  it("renders nothing when not visible", () => {
    const { queryByText } = render(
      <Toast message="Error" visible={false} onDismiss={() => {}} />
    );
    expect(queryByText("Error")).toBeNull();
  });

  it("renders success variant by default", () => {
    const { toJSON } = render(
      <Toast message="OK" visible onDismiss={() => {}} />
    );
    expect(toJSON()).not.toBeNull();
  });

  it("renders error variant", () => {
    const { getByText } = render(
      <Toast message="Failed to save" variant="error" visible onDismiss={() => {}} />
    );
    expect(getByText("Failed to save")).toBeTruthy();
  });

  it("calls onDismiss after duration", async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    render(
      <Toast
        message="Test"
        visible
        onDismiss={onDismiss}
        durationMs={1000}
      />
    );
    expect(onDismiss).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });
});
