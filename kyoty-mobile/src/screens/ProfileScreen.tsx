import React, { useEffect, useState } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, ScrollView,
    ActivityIndicator, SafeAreaView, Platform, StatusBar, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/clerk-expo';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { createSupabaseClient } from '../lib/supabase';

const PRIMARY_COLOR = '#6C47FF';
const PRIMARY_LIGHT = '#F5F3FF';
const BG_COLOR = '#F8FAFC';

interface CommunityMembership {
    id: number;
    status: string;
    community: {
        id: number;
        name: string;
        slug: string;
        category: string | null;
        member_count: number;
    };
}

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { getToken } = useClerkAuth();
    const { user: clerkUser } = useClerkUser();
    const navigation = useNavigation<any>();
    const [memberships, setMemberships] = useState<CommunityMembership[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMemberships();
    }, [user]);

    const fetchMemberships = async () => {
        if (!user || user.id === 0) {
            setLoading(false);
            return;
        }

        try {
            const token = await getToken({ template: 'supabase' }).catch(() => null)
                ?? await getToken().catch(() => null);
            const supabase = createSupabaseClient(token);

            const { data } = await supabase
                .from('community_members')
                .select('id, status, communities:community_id(id, name, slug, category, member_count)')
                .eq('user_id', user.id);

            if (data) {
                const mapped = data.map((row: any) => ({
                    id: row.id,
                    status: row.status,
                    community: row.communities,
                }));
                setMemberships(mapped);
            }
        } catch (e) {
            console.error('Error fetching memberships:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
        ]);
    };

    const handleCommunityPress = async (communityId: number) => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        navigation.navigate('CommunityDetail', { communityId });
    };

    const memberSince = clerkUser?.createdAt
        ? new Date(clerkUser.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
        })
        : 'Recently';

    const approvedMemberships = memberships.filter((m) => m.status === 'approved');
    const pendingMemberships = memberships.filter((m) => m.status === 'pending');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {(user?.name ?? 'U').charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.profileName}>{user?.name ?? 'User'}</Text>
                    <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>

                    <View style={styles.profileMeta}>
                        <View style={styles.profileMetaItem}>
                            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                            <Text style={styles.profileMetaText}>Member since {memberSince}</Text>
                        </View>
                        <View style={styles.profileMetaItem}>
                            <Ionicons name="shield-checkmark-outline" size={14} color="#6B7280" />
                            <Text style={styles.profileMetaText}>{user?.role ?? 'participant'}</Text>
                        </View>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{approvedMemberships.length}</Text>
                        <Text style={styles.statLabel}>Communities</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{pendingMemberships.length}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                </View>

                {/* My Communities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Communities</Text>

                    {loading ? (
                        <ActivityIndicator size="small" color={PRIMARY_COLOR} style={{ marginTop: 12 }} />
                    ) : approvedMemberships.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="people-outline" size={36} color="#D1D5DB" />
                            <Text style={styles.emptyText}>Not a member of any community yet.</Text>
                        </View>
                    ) : (
                        approvedMemberships.map((m) => (
                            <TouchableOpacity
                                key={m.id}
                                style={styles.communityCard}
                                onPress={() => handleCommunityPress(m.community.id)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.communityIcon}>
                                    <Ionicons name="people" size={20} color={PRIMARY_COLOR} />
                                </View>
                                <View style={styles.communityInfo}>
                                    <Text style={styles.communityName}>{m.community.name}</Text>
                                    <Text style={styles.communityMeta}>
                                        {m.community.category ?? 'Community'} · {m.community.member_count} members
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Pending */}
                {pendingMemberships.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Pending Applications</Text>
                        {pendingMemberships.map((m) => (
                            <View key={m.id} style={styles.communityCard}>
                                <View style={[styles.communityIcon, { backgroundColor: '#FEF3C7' }]}>
                                    <Ionicons name="time" size={20} color="#F59E0B" />
                                </View>
                                <View style={styles.communityInfo}>
                                    <Text style={styles.communityName}>{m.community.name}</Text>
                                    <Text style={styles.communityMeta}>Awaiting approval</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Sign Out Button */}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_COLOR,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 8,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: PRIMARY_COLOR,
        letterSpacing: -0.5,
    },
    profileCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: PRIMARY_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
    },
    profileName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 16,
    },
    profileMeta: {
        flexDirection: 'row',
        gap: 20,
    },
    profileMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    profileMetaText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: PRIMARY_COLOR,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 36,
        backgroundColor: '#E5E7EB',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 12,
    },
    emptyCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    communityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    communityIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: PRIMARY_LIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    communityInfo: {
        flex: 1,
    },
    communityName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 2,
    },
    communityMeta: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 32,
        padding: 16,
        borderRadius: 14,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    },
});
