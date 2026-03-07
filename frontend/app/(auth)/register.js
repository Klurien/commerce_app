import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('buyer');

    const { register, loginWithGoogle, error, isLoading } = useContext(AuthContext);
    const router = useRouter();

    const handleRegister = () => {
        register(name, email, password, role, phone);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.innerContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join the Bolt Market community</Text>
                    </View>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <View style={styles.form}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. John Doe"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor={COLORS.textMuted}
                        />

                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="name@email.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            placeholderTextColor={COLORS.textMuted}
                        />

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+1 234 567 890"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholderTextColor={COLORS.textMuted}
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor={COLORS.textMuted}
                        />

                        <View style={styles.roleContainer}>
                            <Text style={styles.label}>Choose your role</Text>
                            <View style={styles.roleButtons}>
                                <TouchableOpacity
                                    style={[styles.roleButton, role === 'buyer' && styles.roleButtonActive]}
                                    onPress={() => setRole('buyer')}
                                >
                                    <Text style={[styles.roleText, role === 'buyer' && styles.roleTextActive]}>Buyer</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.roleButton, role === 'seller' && styles.roleButtonActive]}
                                    onPress={() => setRole('seller')}
                                >
                                    <Text style={[styles.roleText, role === 'seller' && styles.roleTextActive]}>Seller</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.buttonText}>Get Started</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={[styles.googleButton, isLoading && styles.buttonDisabled]}
                            onPress={() => loginWithGoogle(role)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={COLORS.secondary} />
                            ) : (
                                <Text style={styles.googleButtonText}>Continue with Google</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text style={styles.linkText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    innerContainer: {
        padding: SPACING.lg,
        paddingTop: SPACING.xxl,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textMuted,
    },
    errorContainer: {
        backgroundColor: '#FFE5E5',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    errorText: {
        color: COLORS.error,
        textAlign: 'center',
        fontWeight: '500',
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.secondary,
        marginBottom: SPACING.sm,
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.md,
        fontSize: 16,
        color: COLORS.secondary,
    },
    roleContainer: {
        marginVertical: SPACING.md,
        marginBottom: SPACING.xl,
    },
    roleButtons: {
        flexDirection: 'row',
        marginTop: SPACING.xs,
    },
    roleButton: {
        flex: 1,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: RADIUS.round,
        marginRight: SPACING.sm,
        alignItems: 'center',
    },
    roleButtonActive: {
        backgroundColor: COLORS.primary,
    },
    roleText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    roleTextActive: {
        color: COLORS.white,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: RADIUS.round,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    buttonDisabled: {
        backgroundColor: COLORS.textMuted,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.xxl,
    },
    footerText: {
        color: COLORS.textMuted,
        fontSize: 15,
    },
    linkText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: '700',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        marginHorizontal: SPACING.md,
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    googleButton: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: RADIUS.round,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.light,
    },
    googleButtonText: {
        color: COLORS.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
