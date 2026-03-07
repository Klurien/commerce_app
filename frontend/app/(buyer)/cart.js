import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import axios from 'axios';
import API from '../../constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const CartScreen = () => {
    const { cartItems, cartTotal, updateQuantity, clearCart, cartCount } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [recipientName, setRecipientName] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState({
        latitude: -1.2921,
        longitude: 36.8219,
    });
    const [isGifting, setIsGifting] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const mapRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setDeliveryAddress('Location permission denied');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const newCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
        setDeliveryLocation(newCoords);

        // Reverse geocode for a readable address
        try {
            let [addr] = await Location.reverseGeocodeAsync(newCoords);
            if (addr) {
                setDeliveryAddress(`${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}`);
            }
        } catch (err) {
            setDeliveryAddress('Pinned Location');
        }
    };

    const handleMapPress = async (e) => {
        const coords = e.nativeEvent.coordinate;
        setDeliveryLocation(coords);
        try {
            let [addr] = await Location.reverseGeocodeAsync(coords);
            if (addr) {
                setDeliveryAddress(`${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}`);
            }
        } catch (err) {
            setDeliveryAddress('Custom Pinned Location');
        }
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        if (!deliveryAddress || deliveryAddress === 'Location permission denied') {
            Alert.alert("Missing Location", "Please set a delivery location first.");
            return;
        }

        setLoading(true);
        try {
            const sellerId = cartItems[0].sellerId;

            const orderData = {
                sellerId,
                items: cartItems.map(item => ({
                    dishId: item._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: cartTotal,
                deliveryAddress,
                deliveryLocation: {
                    type: 'Point',
                    coordinates: [deliveryLocation.longitude, deliveryLocation.latitude]
                },
                recipientName: isGifting ? recipientName : user.name
            };

            await axios.post(`${API.BUYER}/orders`, orderData);

            Alert.alert(
                "Order Placed!",
                `Your order is being prepared. It will be delivered to ${deliveryAddress}`,
                [{
                    text: "Track Order", onPress: () => {
                        clearCart();
                        router.push('/(buyer)/profile');
                    }
                }]
            );
        } catch (error) {
            console.error('Checkout error:', error);
            Alert.alert("Error", "Failed to place order. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => updateQuantity(item._id, -1)} style={styles.qtyBtn}>
                    <Ionicons name="remove" size={18} color={COLORS.secondary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item._id, 1)} style={styles.qtyBtn}>
                    <Ionicons name="add" size={18} color={COLORS.secondary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={80} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(buyer)/')}>
                    <Text style={styles.browseText}>Explore Restaurants</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Selection</Text>
                <Text style={styles.itemCount}>{cartCount} items</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <FlatList
                    data={cartItems}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.listContent}
                />

                <View style={styles.deliverySection}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="location" size={20} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Delivery Location</Text>
                    </View>

                    <TouchableOpacity style={styles.addressBox} onPress={() => setShowMap(!showMap)}>
                        <View style={styles.addressInfo}>
                            <Text style={styles.addressText} numberOfLines={2}>{deliveryAddress || 'Detecting location...'}</Text>
                        </View>
                        <Text style={styles.changeText}>{showMap ? 'Confirm' : 'Change'}</Text>
                    </TouchableOpacity>

                    {showMap && (
                        <View style={styles.mapContainer}>
                            <MapView
                                ref={mapRef}
                                style={styles.miniMap}
                                initialRegion={{
                                    ...deliveryLocation,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                onPress={handleMapPress}
                            >
                                <Marker coordinate={deliveryLocation} pinColor={COLORS.primary} />
                            </MapView>
                            <TouchableOpacity style={styles.locateBtn} onPress={getCurrentLocation}>
                                <Ionicons name="locate" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.giftingToggle}
                        onPress={() => setIsGifting(!isGifting)}
                    >
                        <Ionicons
                            name={isGifting ? "checkbox" : "square-outline"}
                            size={20}
                            color={isGifting ? COLORS.primary : COLORS.textMuted}
                        />
                        <Text style={[styles.giftingText, isGifting && styles.activeGiftingText]}>
                            This is a gift for someone else
                        </Text>
                    </TouchableOpacity>

                    {isGifting && (
                        <TextInput
                            style={styles.input}
                            placeholder="Recipient's Name"
                            value={recipientName}
                            onChangeText={setRecipientName}
                        />
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Grand Total</Text>
                    <Text style={styles.totalValue}>${cartTotal.toFixed(2)}</Text>
                </View>

                <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={handleCheckout}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.checkoutText}>Proceed to Checkout • ${cartTotal.toFixed(2)}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: 60,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.white,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    itemCount: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.background,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.background,
    },
    itemInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    itemPrice: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
        marginTop: 2,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.round,
        padding: 4,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginHorizontal: 8,
        minWidth: 15,
        textAlign: 'center',
    },
    deliverySection: {
        padding: SPACING.lg,
        marginTop: SPACING.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginLeft: 8,
    },
    addressBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.md,
    },
    addressInfo: {
        flex: 1,
    },
    addressText: {
        fontSize: 14,
        color: COLORS.secondary,
        fontWeight: '500',
    },
    changeText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: SPACING.md,
    },
    mapContainer: {
        height: 200,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    miniMap: {
        width: '100%',
        height: '100%',
    },
    locateBtn: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: COLORS.white,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.light,
    },
    giftingToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    giftingText: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginLeft: 8,
    },
    activeGiftingText: {
        color: COLORS.secondary,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        fontSize: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    footer: {
        padding: SPACING.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.lg,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    totalLabel: {
        fontSize: 16,
        color: COLORS.textMuted,
    },
    totalValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    checkoutBtn: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: RADIUS.round,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    checkoutText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginTop: SPACING.md,
        marginBottom: SPACING.xl,
    },
    browseBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.round,
    },
    browseText: {
        color: COLORS.white,
        fontWeight: 'bold',
    }
});

export default CartScreen;
