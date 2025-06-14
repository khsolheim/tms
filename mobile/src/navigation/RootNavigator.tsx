<<<<<<< HEAD
import React from 'react';
import { View, Text } from 'react-native';

export const RootNavigator: React.FC = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>TMS Mobile App</Text>
      <Text>Navigation will be implemented here</Text>
    </View>
=======
/**
 * Root Navigator for TMS Mobile App
 * Main navigation structure for the mobile application
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Screens (placeholder components for now)
const LoginScreen = () => <Text style={{ flex: 1, textAlign: 'center', marginTop: 100 }}>Login Screen</Text>;
const HomeScreen = () => <Text style={{ flex: 1, textAlign: 'center', marginTop: 100 }}>Home Screen</Text>;
const StudentsScreen = () => <Text style={{ flex: 1, textAlign: 'center', marginTop: 100 }}>Students Screen</Text>;
const ScheduleScreen = () => <Text style={{ flex: 1, textAlign: 'center', marginTop: 100 }}>Schedule Screen</Text>;
const SafetyScreen = () => <Text style={{ flex: 1, textAlign: 'center', marginTop: 100 }}>Safety Control Screen</Text>;
const ProfileScreen = () => <Text style={{ flex: 1, textAlign: 'center', marginTop: 100 }}>Profile Screen</Text>;

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

interface RootNavigatorProps {
  isAuthenticated: boolean;
}

const AuthenticatedTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
        },
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Hjem',
          tabBarLabel: 'Hjem',
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Students"
        component={StudentsScreen}
        options={{
          title: 'Elever',
          tabBarLabel: 'Elever',
          tabBarIcon: () => <Text>👥</Text>,
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          title: 'Timeplan',
          tabBarLabel: 'Timeplan',
          tabBarIcon: () => <Text>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Safety"
        component={SafetyScreen}
        options={{
          title: 'Sikkerhet',
          tabBarLabel: 'Sikkerhet',
          tabBarIcon: () => <Text>🛡️</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Logg inn',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export const RootNavigator: React.FC<RootNavigatorProps> = ({ isAuthenticated }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={AuthenticatedTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
  );
}; 