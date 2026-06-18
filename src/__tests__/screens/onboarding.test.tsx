import { describe, it, expect } from "@jest/globals";

// Mock expo-router hooks — onboarding screens use useRouter
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

import { render } from "@testing-library/react-native";

// Import screens after mock is set up
import WelcomeScreen from "@/app/onboarding/welcome";
import AutoImportTeaserScreen from "@/app/onboarding/auto-import-teaser";
import ManualEntryScreen from "@/app/onboarding/manual-entry";

describe("Onboarding Screens", () => {
  describe("WelcomeScreen", () => {
    it("renders without crashing", () => {
      const { toJSON } = render(<WelcomeScreen />);
      expect(toJSON()).not.toBeNull();
    });

    it("shows app name", () => {
      const { getByText } = render(<WelcomeScreen />);
      expect(getByText("Welcome to MoneyTracker")).toBeTruthy();
    });

    it("shows tagline", () => {
      const { getByText } = render(<WelcomeScreen />);
      expect(
        getByText("Track your spending automatically or manually")
      ).toBeTruthy();
    });

    it("shows Get Started button", () => {
      const { getByText } = render(<WelcomeScreen />);
      expect(getByText("Get Started")).toBeTruthy();
    });
  });

  describe("AutoImportTeaserScreen", () => {
    it("renders without crashing", () => {
      const { toJSON } = render(<AutoImportTeaserScreen />);
      expect(toJSON()).not.toBeNull();
    });

    it("shows teaser heading", () => {
      const { getByText } = render(<AutoImportTeaserScreen />);
      expect(getByText("Track automatically, too")).toBeTruthy();
    });

    it("mentions Profile for setup (AR-4 decision)", () => {
      const { getByText } = render(<AutoImportTeaserScreen />);
      expect(getByText(/Profile/)).toBeTruthy();
    });

    it("shows Sounds good button", () => {
      const { getByText } = render(<AutoImportTeaserScreen />);
      expect(getByText("Sounds good")).toBeTruthy();
    });

    it("shows Skip for now option", () => {
      const { getByText } = render(<AutoImportTeaserScreen />);
      expect(getByText("Skip for now")).toBeTruthy();
    });

    // AR-4 verification: NO intake address, NO keyword form, NO Gmail guide
    it("does NOT show intake address (AR-4 teaser decision)", () => {
      const { queryByText } = render(<AutoImportTeaserScreen />);
      expect(queryByText(/intake\.yourapp\.com/)).toBeNull();
    });

    it("does NOT show keyword input (AR-4 teaser decision)", () => {
      const { queryByText } = render(<AutoImportTeaserScreen />);
      expect(queryByText(/keyword/i)).toBeNull();
    });

    it("does NOT show Gmail setup guide (AR-4 teaser decision)", () => {
      const { queryByText } = render(<AutoImportTeaserScreen />);
      expect(queryByText(/gmail/i)).toBeNull();
      expect(queryByText(/filter/i)).toBeNull();
    });
  });

  describe("ManualEntryScreen", () => {
    it("renders without crashing", () => {
      const { toJSON } = render(<ManualEntryScreen />);
      expect(toJSON()).not.toBeNull();
    });

    it("shows manual entry heading", () => {
      const { getByText } = render(<ManualEntryScreen />);
      expect(
        getByText("You can always add transactions manually")
      ).toBeTruthy();
    });

    it("mentions + button", () => {
      const { getByText } = render(<ManualEntryScreen />);
      expect(getByText(/\+/)).toBeTruthy();
    });

    it("shows Go to Dashboard button", () => {
      const { getByText } = render(<ManualEntryScreen />);
      expect(getByText("Go to Dashboard")).toBeTruthy();
    });
  });
});
