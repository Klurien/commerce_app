import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const ProfileScreen = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>{user?.role}</Text></View>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    header: { backgroundColor: '#fff', padding: 40, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0066cc', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
    name: { fontSize: 22, fontWeight: 'bold' },
    email: { color: '#666', marginBottom: 10 },
    badge: { backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    badgeText: { fontSize: 12, color: '#0066cc', fontWeight: 'bold', textTransform: 'uppercase' },
    logoutBtn: { backgroundColor: '#fff', padding: 20, marginTop: 20, alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
    logoutText: { color: '#d32f2f', fontWeight: 'bold', fontSize: 16 }
});

export default ProfileScreen;
