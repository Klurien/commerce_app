import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#d32f2f', headerShown: true }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'System',
                    tabBarIcon: ({ color }) => <Ionicons name="speedometer" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="users"
                options={{
                    title: 'Users',
                    tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
