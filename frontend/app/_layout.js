import React, { useContext, useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutNav() {
    const { user, isLoading } = useContext(AuthContext);
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Wait until everything is ready
        if (!isMounted || isLoading || !navigationState?.key) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            const role = user.role;
            if (role === 'admin') router.replace('/(admin)');
            else if (role === 'seller') router.replace('/(seller)');
            else router.replace('/(buyer)');
        }
    }, [user, isLoading, segments, navigationState?.key, isMounted]);

    if (isLoading || !isMounted) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#32BB78" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(buyer)" options={{ headerShown: false }} />
            <Stack.Screen name="(seller)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <CartProvider>
                <RootLayoutNav />
            </CartProvider>
        </AuthProvider>
    );
}
