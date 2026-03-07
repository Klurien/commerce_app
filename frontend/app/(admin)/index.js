import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const AdminDashboardScreen = () => {
    const [loading] = useState(false);
    const metrics = { users: 154, hotels: 45, bookings: 89, revenue: 12450 };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>System Control</Text>
                <Text style={styles.subtitle}>Global platform overview</Text>
            </View>

            <View style={styles.grid}>
                <View style={[styles.card, { borderLeftColor: COLORS.primary }]}>
                    <Text style={styles.label}>Total Users</Text>
                    <Text style={styles.value}>{metrics.users}</Text>
                </View>
                <View style={[styles.card, { borderLeftColor: '#4A90E2' }]}>
                    <Text style={styles.label}>Active Hotels</Text>
                    <Text style={styles.value}>{metrics.hotels}</Text>
                </View>
                <View style={[styles.card, { borderLeftColor: '#F5A623' }]}>
                    <Text style={styles.label}>Total Bookings</Text>
                    <Text style={styles.value}>{metrics.bookings}</Text>
                </View>
                <View style={[styles.card, { borderLeftColor: COLORS.error }]}>
                    <Text style={styles.label}>Revenue (USD)</Text>
                    <Text style={[styles.value, { color: COLORS.error }]}>${metrics.revenue}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>System Health</Text>
                <View style={styles.statusCard}>
                    <View style={styles.statusRow}>
                        <View style={styles.statusLabelContainer}>
                            <View style={[styles.statusIndicator, { backgroundColor: COLORS.success }]} />
                            <Text style={styles.statusLabel}>API Gateway</Text>
                        </View>
                        <Text style={styles.statusValue}>Healthy</Text>
                    </View>
                    <View style={styles.statusDivider} />
                    <View style={styles.statusRow}>
                        <View style={styles.statusLabelContainer}>
                            <View style={[styles.statusIndicator, { backgroundColor: COLORS.success }]} />
                            <Text style={styles.statusLabel}>Database Cluster</Text>
                        </View>
                        <Text style={styles.statusValue}>Operational</Text>
                    </View>
                    <View style={styles.statusDivider} />
                    <View style={styles.statusRow}>
                        <View style={styles.statusLabelContainer}>
                            <View style={[styles.statusIndicator, { backgroundColor: COLORS.success }]} />
                            <Text style={styles.statusLabel}>Storage Service</Text>
                        </View>
                        <Text style={styles.statusValue}>99.9% Uptime</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.manageButton}>
                    <Text style={styles.manageButtonText}>Manage User Access</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingTop: 60,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: SPACING.md,
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.md,
        borderLeftWidth: 4,
        ...SHADOWS.light,
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.secondary,
    },
    label: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    section: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: SPACING.md,
    },
    statusCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        ...SHADOWS.light,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    statusLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: SPACING.sm,
    },
    statusLabel: {
        fontSize: 14,
        color: COLORS.secondary,
        fontWeight: '500',
    },
    statusValue: {
        fontSize: 14,
        color: COLORS.textMuted,
    },
    statusDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 4,
    },
    actions: {
        padding: SPACING.lg,
        marginTop: SPACING.xl,
    },
    manageButton: {
        backgroundColor: COLORS.secondary,
        padding: SPACING.md,
        borderRadius: RADIUS.round,
        alignItems: 'center',
    },
    manageButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default AdminDashboardScreen;
