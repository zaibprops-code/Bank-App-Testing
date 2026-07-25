import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AccountProvider, useAccount } from './src/context/AccountContext';
import { SettingsProvider } from './src/context/SettingsContext';
import AppLockGate from './src/components/AppLockGate';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import SendMoneyScreen from './src/screens/SendMoneyScreen';
import QrScanScreen from './src/screens/QrScanScreen';
import NewTransferScreen from './src/screens/NewTransferScreen';
import BankTransferScreen from './src/screens/BankTransferScreen';
import AmountScreen from './src/screens/AmountScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import ReceiptScreen from './src/screens/ReceiptScreen';
import ProfileScreen from './src/screens/menu/ProfileScreen';
import AccountsScreen from './src/screens/menu/AccountsScreen';
import SettingsScreen from './src/screens/menu/SettingsScreen';
import NotificationsScreen from './src/screens/menu/NotificationsScreen';
import QiblaScreen from './src/screens/menu/QiblaScreen';
import FaqsScreen from './src/screens/menu/FaqsScreen';
import DealsScreen from './src/screens/menu/DealsScreen';
import TermsScreen from './src/screens/menu/TermsScreen';
import ChargesScreen from './src/screens/menu/ChargesScreen';
import LocateUsScreen from './src/screens/menu/LocateUsScreen';
import ContactUsScreen from './src/screens/menu/ContactUsScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AccountProvider>
        <SettingsProvider>
          <StatusBar style="light" />
          <RootGate />
        </SettingsProvider>
      </AccountProvider>
    </SafeAreaProvider>
  );
}

// Decides what to show once account state has loaded: the one-time onboarding
// (first launch, no name yet) or the main app behind the biometric lock gate.
function RootGate() {
  const { loaded, setupComplete } = useAccount();

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.screenBg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!setupComplete) {
    return <OnboardingScreen />;
  }

  return (
    <AppLockGate>
      <MainApp />
    </AppLockGate>
  );
}

function MainApp() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Transactions"
              component={TransactionsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NewTransfer"
              component={NewTransferScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BankTransfer"
              component={BankTransferScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Amount"
              component={AmountScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Review"
              component={ReviewScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SendMoney"
              component={SendMoneyScreen}
              options={{ title: 'Send Money' }}
            />
            <Stack.Screen
              name="QrScan"
              component={QrScanScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Receipt"
              component={ReceiptScreen}
              options={{ headerShown: false }}
            />

            {/* Side-menu screens */}
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
            <Stack.Screen name="Accounts" component={AccountsScreen} options={{ title: 'My Accounts' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
            <Stack.Screen name="Qibla" component={QiblaScreen} options={{ title: 'Qibla' }} />
            <Stack.Screen name="Faqs" component={FaqsScreen} options={{ title: 'FAQs' }} />
            <Stack.Screen name="Deals" component={DealsScreen} options={{ title: 'Deals & Discounts' }} />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms & Conditions' }} />
            <Stack.Screen name="Charges" component={ChargesScreen} options={{ title: 'Schedule of Charges' }} />
            <Stack.Screen name="LocateUs" component={LocateUsScreen} options={{ title: 'Locate Us' }} />
            <Stack.Screen name="ContactUs" component={ContactUsScreen} options={{ title: 'Contact Us' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
