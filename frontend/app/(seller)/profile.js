import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, Dimensions, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import API from '../../constants/api';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const SellerProfileScreen = () => {
    const { user, logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [tempLocation, setTempLocation] = useState(null);
    const [business, setBusiness] = useState(null);
    const [activeTab, setActiveTab] = useState('branding'); // branding, management, settings
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        category: '',
        logo: '',
        image: '',
        pricePerNight: 0,
        location: {
            type: 'Point',
            coordinates: [31.2357, 30.0444]
        }
    });

    useEffect(() => {
        fetchBusiness();
    }, []);

    const fetchBusiness = async () => {
        try {
            const { data } = await axios.get(`${API.SELLER}/hotels`);
            const myBusiness = data.find(h => h.sellerId === user._id);
            if (myBusiness) {
                setBusiness(myBusiness);
                setFormData({
                    name: myBusiness.name,
                    address: myBusiness.address,
                    category: myBusiness.category || '',
                    logo: myBusiness.logo || '',
                    image: myBusiness.image || '',
                    pricePerNight: myBusiness.pricePerNight || 0,
                    location: myBusiness.location
                });
            }
        } catch (error) {
            console.error('Error fetching official profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async (field) => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need gallery access to update your official profile.');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: field === 'logo' ? [1, 1] : [16, 9],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setFormData({ ...formData, [field]: base64Img });
            }
        } catch (error) {
            console.error('PickImage Error:', error);
            Alert.alert('Error', 'Failed to pick image.');
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.address) {
            Alert.alert("Missing Info", "Business name and address are required for your official profile.");
            return;
        }

        setSaving(true);
        try {
            if (business) {
                await axios.put(`${API.SELLER}/hotels/${business._id}`, formData);
            } else {
                await axios.post(`${API.SELLER}/hotels`, formData);
            }
            Alert.alert("Profile Updated", "Your official seller presence has been updated! 🎉");
            fetchBusiness();
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleMapDragEnd = (e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setTempLocation({
            type: 'Point',
            coordinates: [longitude, latitude]
        });
    };

    const confirmLocation = async () => {
        if (tempLocation) {
            let newAddress = formData.address;
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const [longitude, latitude] = tempLocation.coordinates;
                    let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
                    if (geocode && geocode.length > 0) {
                        const spot = geocode[0];
                        const parts = [spot.name, spot.street, spot.city].filter(Boolean);
                        if (parts.length > 0) {
                            newAddress = parts.join(', ');
                        }
                    }
                }
            } catch (error) {
                console.error("Reverse geocode error:", error);
            }

            setFormData(prev => ({
                ...prev,
                location: tempLocation,
                address: newAddress
            }));
        }
        setMapModalVisible(false);
    };

    const openMapModal = () => {
        setTempLocation(formData.location);
        setMapModalVisible(true);
    };

    const renderBranding = () => (
        <View style={styles.tabContent}>
            {/* Professional Cover Header */}
            <TouchableOpacity style={styles.coverContainer} onPress={() => pickImage('image')}>
                {formData.image ? (
                    <Image source={{ uri: formData.image }} style={styles.coverImage} />
                ) : (
                    <View style={styles.coverPlaceholder}>
                        <Ionicons name="image-outline" size={40} color={COLORS.textMuted} />
                        <Text style={styles.addPhotoText}>Official Banner</Text>
                    </View>
                )}
                <View style={styles.coverOverlay} />
                <View style={styles.editBadge}>
                    <Ionicons name="camera" size={16} color={COLORS.white} />
                </View>

                {/* Logo Overlap */}
                <TouchableOpacity style={styles.logoWrapper} onPress={() => pickImage('logo')}>
                    <View style={styles.logoBorder}>
                        {formData.logo ? (
                            <Image source={{ uri: formData.logo }} style={styles.logoImage} />
                        ) : (
                            <View style={styles.logoPlaceholder}>
                                <Ionicons name="business" size={30} color={COLORS.textMuted} />
                            </View>
                        )}
                        <View style={styles.logoEditBadge}>
                            <Ionicons name="camera" size={12} color={COLORS.white} />
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>

            <View style={styles.formContainer}>
                <Text style={styles.sectionTitle}>Identity & Presence</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Official Seller Name</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder="Public Brand Name"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Niche / Category</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.category}
                        onChangeText={(text) => setFormData({ ...formData, category: text })}
                        placeholder="e.g. Gourmet Burger Hub"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Business Address</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.address}
                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                        placeholder="Public Location Address"
                    />
                </View>

                <Text style={styles.sectionTitle}>Global Positioning</Text>

                <TouchableOpacity style={styles.locationSummaryCard} onPress={openMapModal}>
                    <View style={styles.locationSummaryIcon}>
                        <Ionicons name="map" size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.locationSummaryTextGroup}>
                        <Text style={styles.locationSummaryTitle}>Business Coordinates</Text>
                        <Text style={styles.locationSummaryCoords}>
                            {formData.location.coordinates[1].toFixed(4)}, {formData.location.coordinates[0].toFixed(4)}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
                </TouchableOpacity>

                <Modal visible={mapModalVisible} animationType="slide" presentationStyle="pageSheet">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setMapModalVisible(false)} style={styles.modalCloseBtn}>
                                <Ionicons name="close" size={24} color={COLORS.secondary} />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Pin Location</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <MapView
                            style={styles.fullMap}
                            initialRegion={{
                                latitude: formData.location.coordinates[1],
                                longitude: formData.location.coordinates[0],
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: tempLocation ? tempLocation.coordinates[1] : formData.location.coordinates[1],
                                    longitude: tempLocation ? tempLocation.coordinates[0] : formData.location.coordinates[0],
                                }}
                                draggable
                                onDragEnd={handleMapDragEnd}
                            >
                                <View style={styles.customMarker}>
                                    <View style={styles.markerBadge}>
                                        {formData.logo ? (
                                            <Image source={{ uri: formData.logo }} style={styles.markerLogo} />
                                        ) : (
                                            <Text style={styles.markerText}>{formData.name ? formData.name[0] : 'B'}</Text>
                                        )}
                                    </View>
                                    <View style={styles.markerStem} />
                                </View>
                            </Marker>
                        </MapView>

                        <View style={styles.mapActionRow}>
                            <View style={styles.mapTipBadge}>
                                <Ionicons name="information-circle" size={16} color={COLORS.primary} />
                                <Text style={styles.mapTipText}>Hold and drag the pin to your exact location</Text>
                            </View>
                            <TouchableOpacity style={styles.confirmLocationBtn} onPress={confirmLocation}>
                                <Text style={styles.confirmLocationText}>Confirm Location</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <TouchableOpacity
                    style={[styles.saveBtn, saving && styles.disabledBtn]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save Official Changes</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSettings = () => (
        <View style={styles.settingsSection}>
            <View style={styles.accountCard}>
                <View style={styles.accountHeader}>
                    <Text style={styles.accountTitle}>Account Access</Text>
                    <Text style={styles.accountEmail}>{user?.email}</Text>
                </View>
                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="notifications-outline" size={20} color={COLORS.secondary} />
                    <Text style={styles.menuText}>Push Notifications</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="card-outline" size={20} color={COLORS.secondary} />
                    <Text style={styles.menuText}>Earnings & Payouts</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.secondary} />
                    <Text style={styles.menuText}>Legal & Privacy</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
                <Text style={styles.logoutText}>Terminate Session</Text>
            </TouchableOpacity>

            <Text style={styles.versionInfo}>Official Merchant Platform • v4.0.0</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Unified Nav Tabs */}
            <View style={styles.navBar}>
                <TouchableOpacity
                    style={[styles.navTab, activeTab === 'branding' && styles.activeNavTab]}
                    onPress={() => setActiveTab('branding')}
                >
                    <Text style={[styles.navTabText, activeTab === 'branding' && styles.activeNavTabText]}>Business Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.navTab, activeTab === 'settings' && styles.activeNavTab]}
                    onPress={() => setActiveTab('settings')}
                >
                    <Text style={[styles.navTabText, activeTab === 'settings' && styles.activeNavTabText]}>Account Settings</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'branding' ? renderBranding() : renderSettings()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navBar: {
        flexDirection: 'row',
        paddingTop: 60,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    navTab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    activeNavTab: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
    },
    navTabText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textMuted,
    },
    activeNavTabText: {
        color: COLORS.primary,
    },
    tabContent: {
        flex: 1,
    },
    coverContainer: {
        width: '100%',
        height: 180,
        backgroundColor: COLORS.background,
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    addPhotoText: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '700',
        marginTop: 8,
    },
    editBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        position: 'absolute',
        bottom: -40,
        left: 20,
    },
    logoBorder: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.white,
        padding: 4,
        ...SHADOWS.medium,
    },
    logoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 45,
    },
    logoPlaceholder: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoEditBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    formContainer: {
        marginTop: 50,
        padding: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.secondary,
        marginTop: SPACING.xl,
        marginBottom: 4,
    },
    inputGroup: {
        marginTop: SPACING.lg,
    },
    label: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: COLORS.background,
        padding: 16,
        borderRadius: RADIUS.md,
        fontSize: 15,
        color: COLORS.secondary,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    locationSummaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginTop: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    locationSummaryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0, 102, 204, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    locationSummaryTextGroup: {
        flex: 1,
    },
    locationSummaryTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    locationSummaryCoords: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: 50,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalCloseBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    fullMap: {
        flex: 1,
    },
    mapActionRow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        ...SHADOWS.medium,
    },
    mapTipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 102, 204, 0.1)',
        padding: SPACING.sm,
        borderRadius: RADIUS.sm,
        marginBottom: SPACING.lg,
    },
    mapTipText: {
        marginLeft: 8,
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '500',
    },
    confirmLocationBtn: {
        backgroundColor: COLORS.primary,
        height: 54,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmLocationText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    customMarker: {
        alignItems: 'center',
    },
    markerBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
        ...SHADOWS.medium,
        overflow: 'hidden',
    },
    markerLogo: {
        width: '100%',
        height: '100%',
    },
    markerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    markerStem: {
        width: 2,
        height: 12,
        backgroundColor: COLORS.primary,
        marginTop: -2,
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.xxl,
        marginBottom: SPACING.xxl,
        ...SHADOWS.medium,
    },
    saveBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledBtn: {
        opacity: 0.7,
    },
    settingsSection: {
        padding: SPACING.lg,
    },
    accountCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        ...SHADOWS.light,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    accountHeader: {
        marginBottom: SPACING.xl,
    },
    accountTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    accountEmail: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    menuText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    logoutBtn: {
        flexDirection: 'row',
        backgroundColor: '#FFF1F2',
        marginTop: SPACING.xxl,
        padding: 16,
        borderRadius: RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutText: {
        color: COLORS.error,
        fontWeight: '800',
        marginLeft: 8,
    },
    versionInfo: {
        textAlign: 'center',
        marginTop: 40,
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '500',
    }
});

export default SellerProfileScreen;
