import { Tabs, useRouter } from "expo-router";
import {
  House,
  LayoutList,
  CirclePlus,
  Tag,
  User,
  type LucideIcon,
} from "lucide-react-native";

import { Colors } from "@/src/constants/colors";

interface TabConfig {
  name: string;
  title: string;
  icon: LucideIcon;
  isAddButton?: boolean;
  onPress?: (router: ReturnType<typeof useRouter>) => void;
}

const TABS: TabConfig[] = [
  { name: "index", title: "Home", icon: House },
  { name: "transactions", title: "Transactions", icon: LayoutList },
  {
    name: "add",
    title: "",
    icon: CirclePlus,
    isAddButton: true,
    onPress: (router) => {
      router.push("/add-transaction" as never);
    },
  },
  { name: "categories", title: "Categories", icon: Tag },
  { name: "profile", title: "Profile", icon: User },
];

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.plum,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 0.5,
          borderTopColor: Colors.border,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      {TABS.map((tab) => {
        // The center "Add" tab navigates to a full screen instead of a tab
        if (tab.isAddButton) {
          return (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: "",
                tabBarIcon: ({ color }) => (
                  <tab.icon
                    size={28}
                    color={Colors.tangerine}
                    strokeWidth={2}
                  />
                ),
                tabBarLabel: () => null,
              }}
              listeners={{
                tabPress: (e) => {
                  e.preventDefault();
                  tab.onPress?.(router);
                },
              }}
            />
          );
        }

        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color }) => (
                <tab.icon size={22} color={color} strokeWidth={2} />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}
