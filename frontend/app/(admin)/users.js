import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const ManageUsersScreen = () => {
    const users = [
        { _id: '1', name: 'Admin One', email: 'admin@email.com', role: 'admin' },
        { _id: '2', name: 'Seller One', email: 'seller@email.com', role: 'seller' },
        { _id: '3', name: 'Buyer One', email: 'buyer@email.com', role: 'buyer' }
    ];

    return (
        <View style={styles.container}>
            <FlatList
                data={users}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.email}>{item.email}</Text>
                        </View>
                        <View style={styles.badge}><Text style={styles.badgeText}>{item.role}</Text></View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 1 },
    name: { fontSize: 16, fontWeight: 'bold' },
    email: { color: '#666' },
    badge: { backgroundColor: '#f5f5f5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }
});

export default ManageUsersScreen;
