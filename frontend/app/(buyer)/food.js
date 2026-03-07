import React, { useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { CartContext } from '../../context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const FoodOrderingScreen = () => {
    const { addToCart, cartCount } = useContext(CartContext);
    const router = useRouter();

    const dishes = [
        { _id: '69a8245bcd6c5972f7542562', name: 'Bolt Burger', price: 12, rating: 4.8, image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80', sellerId: '69a8245bcd6c5972f754255e' },
        { _id: '69a8245bcd6c5972f7542563', name: 'Premium Pizza', price: 18, rating: 4.9, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', sellerId: '69a8245bcd6c5972f754255e' }
    ];

    const renderDish = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.rating}>⭐ {item.rating}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>${item.price}</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => addToCart(item)}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Order Food</Text>
                <TouchableOpacity
                    style={styles.cartBtn}
                    onPress={() => router.push('/(buyer)/cart')}
                >
                    <Ionicons name="cart" size={24} color={COLORS.secondary} />
                    {cartCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
            <FlatList
                data={dishes}
                keyExtractor={(item) => item._id}
                renderItem={renderDish}
                numColumns={2}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    cartBtn: {
        position: 'relative',
        padding: 4,
    },
    cartBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: COLORS.primary,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    cartBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    list: {
        padding: SPACING.sm
    },
    card: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        margin: SPACING.xs,
        overflow: 'hidden',
        ...SHADOWS.light
    },
    image: {
        width: '100%',
        height: 140,
    },
    info: {
        padding: SPACING.md,
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: 2,
    },
    rating: {
        fontSize: 10,
        color: COLORS.textMuted,
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        color: COLORS.primary,
        fontWeight: 'bold'
    },
    addButton: {
        backgroundColor: COLORS.secondary,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center'
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: -2,
    }
});

export default FoodOrderingScreen;
