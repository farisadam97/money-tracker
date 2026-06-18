import { describe, it, expect } from "@jest/globals";
import { render } from "@testing-library/react-native";
import { Inbox } from "lucide-react-native";

import { EmptyState } from "@/src/components/shared/empty-state";

describe("EmptyState", () => {
  it("renders heading text", () => {
    const { getByText } = render(
      <EmptyState icon={Inbox} heading="No transactions yet" />
    );
    expect(getByText("No transactions yet")).toBeTruthy();
  });

  it("renders subtext when provided", () => {
    const { getByText } = render(
      <EmptyState
        icon={Inbox}
        heading="No transactions yet"
        subtext="Add your first transaction"
      />
    );
    expect(getByText("Add your first transaction")).toBeTruthy();
  });

  it("renders CTA button when label and handler provided", () => {
    const { getByText } = render(
      <EmptyState
        icon={Inbox}
        heading="Empty"
        ctaLabel="Add Transaction"
        onCtaPress={() => {}}
      />
    );
    expect(getByText("Add Transaction")).toBeTruthy();
  });

  it("does not render CTA when no handler", () => {
    const { queryByText } = render(
      <EmptyState icon={Inbox} heading="Empty" ctaLabel="Add Transaction" />
    );
    expect(queryByText("Add Transaction")).toBeNull();
  });

  it("renders without subtext", () => {
    const { toJSON } = render(<EmptyState icon={Inbox} heading="Just heading" />);
    expect(toJSON()).not.toBeNull();
  });
});
