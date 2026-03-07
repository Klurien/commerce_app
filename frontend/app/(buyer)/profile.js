import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, TextInput, Alert, Modal, Dimensions } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import axios from 'axios';
import API from '../../constants/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const { user, logout, updateProfile } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(user?.name || '');
    const [editedAvatar, setEditedAvatar] = useState(user?.avatar || '');
    const [editedBio, setEditedBio] = useState(user?.bio || '');
    const [updating, setUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState('orders'); // orders, history, settings

    useEffect(() => {
        fetchOrders();
    }, []);

    // Sync state when user context changes
    useEffect(() => {
        if (user) {
            setEditedName(user.name);
            setEditedAvatar(user.avatar);
            setEditedBio(user.bio);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${API.BUYER}/orders`);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (asset.base64) {
                    const base64Img = `data:image/jpeg;base64,${asset.base64}`;
                    setEditedAvatar(base64Img);
                }
            }
        } catch (error) {
            console.error('PickImage Error:', error);
            Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
        }
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            await updateProfile(editedName, editedAvatar, editedBio);
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (err) {
            Alert.alert('Error', 'Failed to update profile.');
        } finally {
            setUpdating(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.topRow}>
                <TouchableOpacity
                    style={styles.avatarWrapper}
                    onPress={isEditing ? pickImage : null}
                    disabled={!isEditing}
                >
                    <View style={styles.avatarBorder}>
                        {editedAvatar ? (
                            <Image source={{ uri: editedAvatar }} style={styles.avatarImg} />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Text style={styles.avatarInitial}>{user?.name?.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                        {isEditing && (
                            <View style={styles.cameraOverlay}>
                                <Ionicons name="camera" size={20} color={COLORS.white} />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{orders.length}</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Favs</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>4.8</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                </View>
            </View>

            <View style={styles.bioContainer}>
                {isEditing ? (
                    <View style={styles.editInputs}>
                        <TextInput
                            style={styles.nameInput}
                            value={editedName}
                            onChangeText={setEditedName}
                            placeholder="Your Name"
                            autoFocus
                        />
                        <TextInput
                            style={styles.bioInput}
                            value={editedBio}
                            onChangeText={setEditedBio}
                            placeholder="Write something about yourself..."
                            multiline
                            maxLength={150}
                        />
                    </View>
                ) : (
                    <>
                        <Text style={styles.displayName}>{user?.name}</Text>
                        <Text style={styles.userRole}>Premium {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</Text>
                        <Text style={styles.userBio}>{user?.bio || 'Exploring the best tastes in town 🍕✨'}</Text>
                    </>
                )}
            </View>

            <View style={styles.actionButtons}>
                {isEditing ? (
                    <>
                        <TouchableOpacity style={[styles.mainActionBtn, styles.saveBtn]} onPress={handleUpdate} disabled={updating}>
                            {updating ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.sideActionBtn, styles.cancelBtn]} onPress={() => {
                            setIsEditing(false);
                            setEditedName(user.name);
                            setEditedAvatar(user.avatar);
                            setEditedBio(user.bio);
                        }}>
                            <Ionicons name="close" size={20} color={COLORS.secondary} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity style={styles.mainActionBtn} onPress={() => setIsEditing(true)}>
                            <Text style={styles.actionBtnText}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sideActionBtn}>
                            <Text style={styles.actionBtnText}>Share Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconActionBtn}>
                            <Ionicons name="person-add-outline" size={18} color={COLORS.secondary} />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
                onPress={() => setActiveTab('orders')}
            >
                <Ionicons name="grid-outline" size={24} color={activeTab === 'orders' ? COLORS.primary : COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                onPress={() => setActiveTab('history')}
            >
                <Ionicons name="list-outline" size={24} color={activeTab === 'history' ? COLORS.primary : COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
                onPress={() => setActiveTab('settings')}
            >
                <Ionicons name="settings-outline" size={24} color={activeTab === 'settings' ? COLORS.primary : COLORS.textMuted} />
            </TouchableOpacity>
        </View>
    );

    const renderOrders = () => (
        <View style={styles.ordersGrid}>
            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
            ) : orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No food memories yet.</Text>
                </View>
            ) : (
                orders.map(order => (
                    <TouchableOpacity key={order._id} style={styles.orderCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.restaurantInfo}>
                                <Text style={styles.restaurantName} numberOfLines={1}>{order.sellerId?.name || 'Restaurant'}</Text>
                                <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                            </View>
                            <View style={[styles.statusTag, { backgroundColor: order.status === 'delivered' ? '#E8F5E9' : '#FFF3E0' }]}>
                                <Text style={[styles.statusTagText, { color: order.status === 'delivered' ? COLORS.primary : '#E65100' }]}>
                                    {order.status}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.itemPreview}>
                            <Text style={styles.itemsCount}>{order.items.length} items • ${order.totalAmount.toFixed(2)}</Text>
                            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </View>
    );

    const renderSettings = () => (
        <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settingsItem}>
                <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.secondary} />
                <Text style={styles.settingsText}>Privacy & Security</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem}>
                <Ionicons name="notifications-outline" size={22} color={COLORS.secondary} />
                <Text style={styles.settingsText}>Notifications</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsItem}>
                <Ionicons name="help-circle-outline" size={22} color={COLORS.secondary} />
                <Text style={styles.settingsText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingsItem, { marginTop: SPACING.xl }]} onPress={logout}>
                <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
                <Text style={[styles.settingsText, { color: COLORS.error }]}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {renderHeader()}
            {renderTabs()}
            {activeTab === 'orders' || activeTab === 'history' ? renderOrders() : renderSettings()}

            <View style={styles.footer}>
                <Text style={styles.versionText}>Marketplace v3.1.0 • Bio Editing</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    headerContainer: {
        paddingTop: 60,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        padding: 4,
    },
    avatarBorder: {
        width: 86,
        height: 86,
        borderRadius: 43,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },
    avatarFallback: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    cameraOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginLeft: SPACING.xl,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.text,
        marginTop: 2,
    },
    bioContainer: {
        marginTop: SPACING.md,
        paddingHorizontal: 4,
    },
    displayName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    editInputs: {
        width: '100%',
    },
    nameInput: {
        fontSize: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingVertical: 8,
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    bioInput: {
        fontSize: 13,
        color: COLORS.secondary,
        marginTop: 8,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        maxHeight: 80,
    },
    userRole: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    userBio: {
        fontSize: 13,
        color: COLORS.secondary,
        marginTop: 4,
        lineHeight: 18,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: SPACING.lg,
        justifyContent: 'space-between',
    },
    mainActionBtn: {
        flex: 1,
        backgroundColor: COLORS.background,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    sideActionBtn: {
        flex: 1,
        backgroundColor: COLORS.background,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    iconActionBtn: {
        width: 32,
        height: 32,
        backgroundColor: COLORS.background,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
    },
    cancelBtn: {
        width: 32,
        flex: 0,
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    saveBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.white,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: COLORS.border,
        marginTop: SPACING.md,
    },
    tab: {
        flex: 1,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTab: {
        borderTopWidth: 1,
        borderTopColor: COLORS.secondary,
    },
    ordersGrid: {
        padding: SPACING.sm,
    },
    orderCard: {
        backgroundColor: COLORS.white,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.border,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    restaurantInfo: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    orderDate: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusTagText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    itemPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    itemsCount: {
        fontSize: 13,
        color: COLORS.text,
    },
    settingsContainer: {
        padding: SPACING.md,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    settingsText: {
        flex: 1,
        marginLeft: SPACING.md,
        fontSize: 15,
        color: COLORS.secondary,
        fontWeight: '500',
    },
    emptyContainer: {
        padding: SPACING.xxl,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
    footer: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 11,
        color: COLORS.textMuted,
    },
});

export default ProfileScreen;
