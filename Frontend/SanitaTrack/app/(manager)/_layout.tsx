import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { House, BookUser, ClipboardList, LayoutGrid, CalendarCheck } from 'lucide-react-native';
import { Icon } from '@gluestack-ui/themed';
import { i18n } from '@/hooks/i18n';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.heading,
        headerShown: false,
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
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t('tabs.home'),
          tabBarIcon: ({ color }) => <Icon as={House} size='xl' color={Colors.heading} />,
        }}
      />
      <Tabs.Screen
        name="team"
        options={{
          title: i18n.t('tabs.team'),
          tabBarIcon: ({ color }) => <Icon as={BookUser} size='xl' color={Colors.heading} />,
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: i18n.t('tabs.rooms'),
          tabBarIcon: ({ color }) => <Icon as={LayoutGrid} size='xl' color={Colors.heading} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: i18n.t('tabs.reports'),
          tabBarIcon: ({ color }) => <Icon as={ClipboardList} size='xl' color={Colors.heading} />,
        }}
      />
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
