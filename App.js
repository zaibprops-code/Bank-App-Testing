import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AccountProvider } from './src/context/AccountContext';
import HomeScreen from './src/screens/HomeScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import SendMoneyScreen from './src/screens/SendMoneyScreen';
import ReceiptScreen from './src/screens/ReceiptScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AccountProvider>
        <StatusBar style="light" />
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
              options={{ title: 'Transactions' }}
            />
            <Stack.Screen
              name="SendMoney"
              component={SendMoneyScreen}
              options={{ title: 'Send Money' }}
            />
            <Stack.Screen
              name="Receipt"
              component={ReceiptScreen}
              options={{ title: 'Transaction Receipt' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AccountProvider>
    </SafeAreaProvider>
  );
}
