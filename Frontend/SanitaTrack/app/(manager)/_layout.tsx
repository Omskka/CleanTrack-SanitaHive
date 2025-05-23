import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { House, BookUser, ClipboardList, LayoutGrid, CalendarCheck } from 'lucide-react-native';
import { Icon } from '@gluestack-ui/themed';
import { i18n } from '@/hooks/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TabLayout() {
  // Get current language from context (triggers re-render on language change)
  const { language } = useLanguage();

  return (
    // Define bottom tab navigation for manager screens
    <Tabs
      screenOptions={{
        // Set active tab color
        tabBarActiveTintColor: Colors.heading,
        // Hide the header for all tabs
        headerShown: false,
        // Set tab bar style for iOS and Android
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: Colors.white,
          },
          default: {
            backgroundColor: Colors.white,
          },
        }),
      }}
    >
      {/* Home tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t('tabs.home'),
          tabBarIcon: ({ color }) => <Icon as={House} size='xl' color={Colors.heading} />,
        }}
      />
      {/* Team tab */}
      <Tabs.Screen
        name="team"
        options={{
          title: i18n.t('tabs.team'),
          tabBarIcon: ({ color }) => <Icon as={BookUser} size='xl' color={Colors.heading} />,
        }}
      />
      {/* Rooms tab */}
      <Tabs.Screen
        name="rooms"
        options={{
          title: i18n.t('tabs.rooms'),
          tabBarIcon: ({ color }) => <Icon as={LayoutGrid} size='xl' color={Colors.heading} />,
        }}
      />
      {/* Reports tab */}
      <Tabs.Screen
        name="reports"
        options={{
          title: i18n.t('tabs.reports'),
          tabBarIcon: ({ color }) => <Icon as={ClipboardList} size='xl' color={Colors.heading} />,
        }}
      />
      {/* Task Page tab */}
      <Tabs.Screen
        name="taskpage"
        options={{
          title: i18n.t('tabs.taskpage'),
          tabBarIcon: ({ color }) => <Icon as={CalendarCheck} size='xl' color={Colors.heading} />,
        }}
      />
    </Tabs>
  );
}