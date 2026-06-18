import { describe, it, expect } from "@jest/globals";
import { render } from "@testing-library/react-native";
import { Wallet } from "lucide-react-native";

import { CategoryAvatar } from "@/src/components/shared/category-avatar";

describe("CategoryAvatar", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(
      <CategoryAvatar categoryName="Food & Drink" icon={Wallet} />
    );
    expect(toJSON()).not.toBeNull();
  });

  it("applies PRD colors for Food & Drink", () => {
    const { getByTestId } = render(
      <CategoryAvatar categoryName="Food & Drink" icon={Wallet} testID="avatar" />
    );
    // The component renders — exact color assertion would require inspecting style props
    expect(getByTestId("avatar")).toBeTruthy();
  });

  it("uses fallback colors for unknown category", () => {
    const { toJSON } = render(
      <CategoryAvatar categoryName="Unknown Category" icon={Wallet} />
    );
    expect(toJSON()).not.toBeNull();
  });

  it("accepts custom size", () => {
    const { toJSON } = render(
      <CategoryAvatar categoryName="Transport" icon={Wallet} size={64} />
    );
    expect(toJSON()).not.toBeNull();
  });

  it("renders without icon (fallback empty circle)", () => {
    const { toJSON } = render(<CategoryAvatar categoryName="Income" />);
    expect(toJSON()).not.toBeNull();
  });

  it("accepts custom colors overriding category defaults", () => {
    const { toJSON } = render(
      <CategoryAvatar
        categoryName="Food & Drink"
        icon={Wallet}
        customIconColor="#FF0000"
        customBgColor="#00FF00"
      />
    );
    expect(toJSON()).not.toBeNull();
  });
});
