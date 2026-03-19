import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

const PRIMARY_COLOR = '#FF5A5F';

export default function LoginScreen() {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password || (!isLogin && !name)) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await login(email, password);
                if (error) Alert.alert('Login Failed', error);
            } else {
                const { error } = await register(email, password, name);
                if (error) Alert.alert('Registration Failed', error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <BlurView intensity={100} tint="light" style={styles.content}>
                <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Join Kyoty'}</Text>
                <Text style={styles.subtitle}>
                    {isLogin ? 'Sign in to discover premium events.' : 'Create an account to start exploring.'}
                </Text>

                {!isLogin && (
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => {
                        setIsLogin(!isLogin);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                >
                    <Text style={styles.switchText}>
                        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                    </Text>
                </TouchableOpacity>
            </BlurView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#FAFAFA',
    },
    content: {
        padding: 30,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 32,
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        backgroundColor: PRIMARY_COLOR,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    switchButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    switchText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '600',
    }
});
