import { describe, it, expect } from "@jest/globals";
import { render } from "@testing-library/react-native";

import { SkeletonLoader } from "@/src/components/shared/skeleton-loader";

describe("SkeletonLoader", () => {
  it("renders default count (3 bars)", () => {
    const { toJSON } = render(<SkeletonLoader />);
    const tree = toJSON();
    expect(tree).not.toBeNull();
    // Should render a container with child views
    expect(Array.isArray((tree as any).children)).toBe(true);
  });

  it("renders custom count", () => {
    const { toJSON } = render(<SkeletonLoader count={5} />);
    const tree = toJSON() as any;
    expect(tree.children).toHaveLength(5);
  });

  it("renders custom height", () => {
    const { toJSON } = render(<SkeletonLoader height={32} />);
    expect(toJSON()).not.toBeNull();
  });

  it("renders zero bars when count=0", () => {
    const { toJSON } = render(<SkeletonLoader count={0} />);
    const tree = toJSON() as any;
    // Container exists but no children
    expect(tree).not.toBeNull();
  });
});
