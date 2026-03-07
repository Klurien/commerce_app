import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BuyerLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#0066cc', headerShown: true }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Hotels',
                    tabBarIcon: ({ color }) => <Ionicons name="bed" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="food"
                options={{
                    title: 'Products',
                    tabBarIcon: ({ color }) => <Ionicons name="fast-food" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="cart"
                options={{
                    title: 'Cart',
                    tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
                }}
            />
            {/* Hide dynamic routes from bottom tab bar */}
            <Tabs.Screen
                name="store/[id]"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="food/[id]"
                options={{
                    href: null,
                    headerShown: false,
                }}
            />
        </Tabs>
    );
}
