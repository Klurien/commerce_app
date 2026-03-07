import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, StyleSheet, Dimensions, Text, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import axios from 'axios';
import API from '../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { AuthContext } from '../../context/AuthContext';

const MapScreen = () => {
    const { user } = useContext(AuthContext);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [loadedMarkers, setLoadedMarkers] = useState(new Set());
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [region, setRegion] = useState({
        latitude: -1.2921,
        longitude: 36.8219,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const mapRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        initializeMap();
    }, []);

    const initializeMap = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Location access is needed to show nearby results.');
            fetchNearbyHotels(-1.2921, 36.8219); // Fallback to default
            return;
        }

        try {
            let location = await Location.getCurrentPositionAsync({});
            const coords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            setUserLocation(coords);
            setRegion({
                ...coords,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
            fetchNearbyHotels(coords.latitude, coords.longitude);
        } catch (err) {
            console.error('Location error:', err);
            fetchNearbyHotels(-1.2921, 36.8219);
        }
    };

    const fetchNearbyHotels = async (lat, lng) => {
        try {
            const url = `${API.BUYER}/hotels/nearby?lat=${lat}&lng=${lng}&distance=5000`;
            const { data } = await axios.get(url);
            setHotels(data);
        } catch (error) {
            console.error('Error fetching map hotels:', error);
            const { data } = await axios.get(`${API.BUYER}/hotels`);
            setHotels(data);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkerDragEnd = (e) => {
        const newCoords = e.nativeEvent.coordinate;
        setUserLocation(newCoords);
        fetchNearbyHotels(newCoords.latitude, newCoords.longitude);
    };

    const centerOnUser = async () => {
        await initializeMap();
        if (userLocation) {
            mapRef.current?.animateToRegion({
                ...userLocation,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            }, 1000);
        }
    };

    if (loading && !userLocation) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
            >
                {userLocation && (
                    <>
                        <Circle
                            center={userLocation}
                            radius={1500}
                            fillColor="rgba(0, 150, 255, 0.05)"
                            strokeColor="rgba(0, 150, 255, 0.2)"
                        />
                        <Marker
                            coordinate={userLocation}
                            draggable
                            onDragEnd={handleMarkerDragEnd}
                        >
                            <View collapsable={false} style={styles.userMarkerWrapper}>
                                <View style={styles.igPinContainer}>
                                    <View style={styles.igPinCircle}>
                                        {user?.avatar ? (
                                            <Image source={{ uri: user.avatar }} style={styles.userAvatarImg} />
                                        ) : (
                                            <View style={styles.defaultAvatar}>
                                                <Text style={styles.avatarInitial}>
                                                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.igPinTail} />
                                </View>
                                <View style={styles.userMarkerHalo} />
                            </View>
                        </Marker>
                    </>
                )}

                {hotels.map((hotel) => (
                    <Marker
                        key={hotel._id}
                        coordinate={{
                            latitude: hotel.location.coordinates[1],
                            longitude: hotel.location.coordinates[0],
                        }}
                        tracksViewChanges={!loadedMarkers.has(hotel._id)}
                        onPress={() => setSelectedHotel(hotel)}
                    >
                        <View collapsable={false} style={styles.userMarkerWrapper}>
                            <View collapsable={false} style={styles.igPinContainer}>
                                <View collapsable={false} style={styles.hotelPinCircle}>
                                    {(hotel.logo || hotel.image) ? (
                                        <Image
                                            source={{ uri: hotel.logo || hotel.image }}
                                            style={styles.userAvatarImg}
                                            onLoad={() =>
                                                setLoadedMarkers(prev => new Set([...prev, hotel._id]))
                                            }
                                            onError={() =>
                                                setLoadedMarkers(prev => new Set([...prev, hotel._id]))
                                            }
                                        />
                                    ) : (
                                        <View collapsable={false} style={styles.hotelDefaultAvatar}>
                                            <Text
                                                style={styles.avatarInitial}
                                                onLayout={() =>
                                                    setLoadedMarkers(prev => new Set([...prev, hotel._id]))
                                                }
                                            >
                                                {hotel.name?.[0]?.toUpperCase() || '?'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <View collapsable={false} style={styles.hotelPinTail} />
                            </View>
                            <View collapsable={false} style={styles.hotelPinHalo} />
                        </View>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.topButtons}>
                <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.secondary} />
                </TouchableOpacity>
                <View style={[styles.infoBadge, { marginLeft: SPACING.md }]}>
                    <Ionicons name="hand-right-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.infoText}>Drag pin to explore area</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.locationButton} onPress={centerOnUser}>
                <Ionicons name="locate" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            {/* Custom Hotel Info Card */}
            {selectedHotel && (
                <TouchableOpacity
                    style={styles.cardOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedHotel(null)}
                >
                    <TouchableOpacity activeOpacity={1} style={styles.hotelCard}>
                        {/* Dismiss */}
                        <TouchableOpacity
                            style={styles.cardClose}
                            onPress={() => setSelectedHotel(null)}
                        >
                            <Ionicons name="close" size={18} color={COLORS.secondary} />
                        </TouchableOpacity>

                        {/* Content */}
                        <View style={styles.cardRow}>
                            <Image
                                source={{ uri: selectedHotel.logo || selectedHotel.image || 'https://via.placeholder.com/100' }}
                                style={styles.cardLogo}
                            />
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardName} numberOfLines={1}>{selectedHotel.name}</Text>
                                <View style={styles.cardRatingRow}>
                                    <Ionicons name="star" size={12} color="#F59E0B" />
                                    <Text style={styles.cardRating}>
                                        {selectedHotel.rating?.toFixed(1) || '4.5'}
                                        <Text style={styles.cardRatingCount}> ({selectedHotel.ratingCount || '50+'})</Text>
                                    </Text>
                                </View>
                                {selectedHotel.address ? (
                                    <Text style={styles.cardAddress} numberOfLines={1}>
                                        <Ionicons name="location-outline" size={11} color={COLORS.textMuted} /> {selectedHotel.address}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.viewStoreBtn}
                            onPress={() => {
                                setSelectedHotel(null);
                                router.push(`/(buyer)/store/${selectedHotel._id}`);
                            }}
                        >
                            <Text style={styles.viewStoreBtnText}>View Store</Text>
                            <Ionicons name="arrow-forward" size={16} color={COLORS.white} style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    },
    // Instagram Style Pin
    userMarkerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
    },
    igPinContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    igPinCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.primary,
        padding: 2,
        ...SHADOWS.medium,
        zIndex: 2,
    },
    userAvatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    defaultAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    igPinTail: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 0,
        borderTopWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: COLORS.primary,
        marginTop: -3,
        zIndex: 1,
    },
    userMarkerHalo: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        zIndex: -1,
    },
    // Hotel IG-style pin (blue border)
    hotelPinCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: '#007AFF',
        padding: 2,
        ...SHADOWS.medium,
        zIndex: 2,
        overflow: 'hidden',
    },
    hotelDefaultAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hotelPinTail: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 0,
        borderTopWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#007AFF',
        marginTop: -3,
        zIndex: 1,
    },
    hotelPinHalo: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        zIndex: -1,
    },
    // Old styles (kept for compatibility)
    customMarker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerBadge: {
        width: 36,
        height: 36,
        backgroundColor: COLORS.secondary,
        borderRadius: 18,
        borderWidth: 3,
        borderColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    markerText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    markerStem: {
        width: 4,
        height: 8,
        backgroundColor: COLORS.white,
        marginTop: -3,
        ...SHADOWS.light,
    },
    calloutWrapper: {
        alignItems: 'center',
        width: 200,
    },
    calloutContainer: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        width: '100%',
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    calloutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    calloutLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: SPACING.sm,
        backgroundColor: COLORS.background,
    },
    calloutInfo: {
        flex: 1,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: COLORS.secondary,
    },
    calloutRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    calloutRating: {
        fontSize: 12,
        color: COLORS.secondary,
        fontWeight: '600',
    },
    calloutRatingCount: {
        fontSize: 10,
        color: COLORS.textMuted,
        marginLeft: 4,
    },
    calloutFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.sm,
        marginTop: SPACING.xs,
    },
    calloutAction: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    calloutTip: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 0,
        borderTopWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: COLORS.white,
        marginTop: -1,
    },
    // Custom info card
    cardOverlay: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0, top: 0,
        justifyContent: 'flex-end',
    },
    hotelCard: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: SPACING.lg,
        paddingBottom: 36,
        ...SHADOWS.medium,
    },
    cardClose: {
        alignSelf: 'flex-end',
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: COLORS.background,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    cardLogo: {
        width: 64, height: 64, borderRadius: RADIUS.lg,
        backgroundColor: COLORS.background,
        marginRight: SPACING.md,
    },
    cardInfo: { flex: 1 },
    cardName: {
        fontSize: 17,
        fontWeight: '800',
        color: COLORS.secondary,
        marginBottom: 4,
    },
    cardRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardRating: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.secondary,
        marginLeft: 4,
    },
    cardRatingCount: {
        fontSize: 11,
        color: COLORS.textMuted,
        fontWeight: '400',
    },
    cardAddress: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    viewStoreBtn: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        height: 50,
        borderRadius: RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.light,
    },
    viewStoreBtnText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '800',
    },
    topButtons: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    circleBtn: {
        width: 45,
        height: 45,
        backgroundColor: COLORS.white,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    infoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: RADIUS.round,
        ...SHADOWS.light,
    },
    infoText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    locationButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 50,
        height: 50,
        backgroundColor: COLORS.white,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
        zIndex: 10,
    }
});

export default MapScreen;
