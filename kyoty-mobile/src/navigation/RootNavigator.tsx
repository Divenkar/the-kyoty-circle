import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import DiscoveryFeed from '../screens/DiscoveryFeed';
import EventDetailScreen from '../screens/EventDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
                <ActivityIndicator size="large" color="#FF5A5F" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!session ? (
                    // Auth Stack
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    // App Stack
                    <>
                        <Stack.Screen name="Discovery" component={DiscoveryFeed} />
                        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
