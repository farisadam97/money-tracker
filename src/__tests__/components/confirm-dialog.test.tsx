import { describe, it, expect } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react-native";

import { ConfirmDialog } from "@/src/components/shared/confirm-dialog";

describe("ConfirmDialog", () => {
  it("renders title and description when visible", () => {
    const { getByText } = render(
      <ConfirmDialog
        visible
        title="Delete transaction?"
        description="This action cannot be undone."
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(getByText("Delete transaction?")).toBeTruthy();
    expect(getByText("This action cannot be undone.")).toBeTruthy();
  });

  it("renders default button labels", () => {
    const { getByText } = render(
      <ConfirmDialog
        visible
        title="Test"
        description="Desc"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("Confirm")).toBeTruthy();
  });

  it("renders custom button labels", () => {
    const { getByText } = render(
      <ConfirmDialog
        visible
        title="Test"
        description="Desc"
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(getByText("Delete")).toBeTruthy();
    expect(getByText("Keep")).toBeTruthy();
  });

  it("calls onConfirm when confirm button pressed", () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <ConfirmDialog
        visible
        title="Test"
        description="Desc"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    fireEvent.press(getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button pressed", () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <ConfirmDialog
        visible
        title="Test"
        description="Desc"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );
    fireEvent.press(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
