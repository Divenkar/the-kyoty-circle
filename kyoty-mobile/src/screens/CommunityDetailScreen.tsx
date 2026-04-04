import React, { useEffect, useState } from 'react';
import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    Image, ActivityIndicator, ScrollView, Platform, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { useAuth } from '../context/AuthContext';
import { createSupabaseClient } from '../lib/supabase';

const PRIMARY_COLOR = '#6C47FF';
const PRIMARY_LIGHT = '#F5F3FF';
const BG_COLOR = '#F8FAFC';

interface Community {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    cover_image_url: string | null;
    member_count: number;
    rating_avg: number;
    cities: { name: string } | null;
}

interface Event {
    id: number;
    title: string;
    location_text: string;
    date: string;
    start_time: string;
    price_per_person: number | null;
    status: string;
}

export default function CommunityDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { communityId } = route.params;
    const { user } = useAuth();
    const { getToken } = useClerkAuth();

    const [community, setCommunity] = useState<Community | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinStatus, setJoinStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchCommunity();
    }, [communityId]);

    const getSupabase = async () => {
        const token = await getToken({ template: 'supabase' }).catch(() => null)
            ?? await getToken().catch(() => null);
        return createSupabaseClient(token);
    };

    const fetchCommunity = async () => {
        try {
            const supabase = await getSupabase();

            const { data: communityData } = await supabase
                .from('communities')
                .select('*, cities(name)')
                .eq('id', communityId)
                .single();

            if (communityData) {
                setCommunity(communityData as Community);
            }

            const { data: eventsData } = await supabase
                .from('events')
                .select('id, title, location_text, date, start_time, price_per_person, status')
                .eq('community_id', communityId)
                .in('status', ['approved', 'open', 'full'])
                .order('date', { ascending: true });

            if (eventsData) {
                setEvents(eventsData as Event[]);
            }

            // Check if user is already a member
            if (user && user.id !== 0) {
                const { data: memberData } = await supabase
                    .from('community_members')
                    .select('status')
                    .eq('community_id', communityId)
                    .eq('user_id', user.id)
                    .single();

                if (memberData) {
                    setJoinStatus(memberData.status);
                }
            }
        } catch (e) {
            console.error('Error fetching community:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        navigation.goBack();
    };

    const handleApplyToJoin = async () => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        if (!user || user.id === 0) {
            Alert.alert('Error', 'Please sign in to join communities.');
            return;
        }

        setJoinLoading(true);
        try {
            const supabase = await getSupabase();

            const { error } = await supabase
                .from('community_members')
                .insert({
                    community_id: communityId,
                    user_id: user.id,
                    status: 'pending',
                });

            if (error) {
                if (error.code === '23505') {
                    Alert.alert('Already Applied', 'You have already applied to join this community.');
                } else {
                    Alert.alert('Error', error.message || 'Failed to apply.');
                }
            } else {
                setJoinStatus('pending');
                Alert.alert('Application Sent', 'Your request to join has been submitted for review.');
            }
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Something went wrong.');
        } finally {
            setJoinLoading(false);
        }
    };

    const handleEventPress = async (event: Event) => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        navigation.navigate('EventDetail', {
            event: {
                ...event,
                communities: { name: community?.name ?? '' },
                image_placeholder: community?.cover_image_url
                    ?? 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop',
            },
        });
    };

    const getJoinButtonLabel = () => {
        if (joinStatus === 'approved') return 'Member';
        if (joinStatus === 'pending') return 'Pending';
        return 'Apply to Join';
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                <Text style={styles.loadingText}>Loading community...</Text>
            </View>
        );
    }

    if (!community) {
        return (
            <View style={styles.center}>
                <Text style={styles.loadingText}>Community not found.</Text>
            </View>
        );
    }

    const coverUri = community.cover_image_url
        ?? 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Cover Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: coverUri }} style={styles.coverImage} />
                    <SafeAreaView style={styles.navHeader}>
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <BlurView intensity={80} tint="dark" style={styles.backButtonBlur}>
                                <Ionicons name="chevron-back" size={24} color="#FFF" />
                            </BlurView>
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                <View style={styles.content}>
                    {/* Category pill */}
                    {community.category && (
                        <View style={styles.categoryPill}>
                            <Text style={styles.categoryText}>{community.category}</Text>
                        </View>
                    )}

                    <Text style={styles.title}>{community.name}</Text>

                    {/* City */}
                    {community.cities?.name && (
                        <View style={styles.metaRow}>
                            <Ionicons name="location-outline" size={16} color="#6B7280" />
                            <Text style={styles.metaText}>{community.cities.name}</Text>
                        </View>
                    )}

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{community.member_count}</Text>
                            <Text style={styles.statLabel}>Members</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{events.length}</Text>
                            <Text style={styles.statLabel}>Events</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{Number(community.rating_avg).toFixed(1)}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                    </View>

                    {/* Description */}
                    {community.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>About</Text>
                            <Text style={styles.description}>{community.description}</Text>
                        </View>
                    )}

                    {/* Events */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Upcoming Events</Text>
                        {events.length === 0 ? (
                            <Text style={styles.emptyText}>No upcoming events yet.</Text>
                        ) : (
                            events.map((evt) => (
                                <TouchableOpacity
                                    key={evt.id}
                                    style={styles.eventCard}
                                    onPress={() => handleEventPress(evt)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.eventDateBox}>
                                        <Text style={styles.eventDateMonth}>
                                            {new Date(evt.date).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
                                        </Text>
                                        <Text style={styles.eventDateDay}>
                                            {new Date(evt.date).getDate()}
                                        </Text>
                                    </View>
                                    <View style={styles.eventInfo}>
                                        <Text style={styles.eventTitle} numberOfLines={2}>{evt.title}</Text>
                                        <View style={styles.eventMeta}>
                                            <Ionicons name="location-outline" size={12} color="#6B7280" />
                                            <Text style={styles.eventMetaText}>{evt.location_text}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.eventPrice}>
                                        {evt.price_per_person ? `₹${evt.price_per_person}` : 'Free'}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <BlurView intensity={100} tint="light" style={styles.bottomBarBlur}>
                    <SafeAreaView edges={['bottom']}>
                        <TouchableOpacity
                            style={[
                                styles.joinButton,
                                joinStatus === 'approved' && styles.joinButtonApproved,
                                joinStatus === 'pending' && styles.joinButtonPending,
                            ]}
                            onPress={handleApplyToJoin}
                            disabled={joinLoading || joinStatus !== null}
                        >
                            {joinLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons
                                        name={joinStatus === 'approved' ? 'checkmark-circle' : 'people'}
                                        size={20}
                                        color="#FFF"
                                    />
                                    <Text style={styles.joinButtonText}>{getJoinButtonLabel()}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </SafeAreaView>
                </BlurView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        backgroundColor: BG_COLOR,
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    imageContainer: {
        height: 280,
        width: '100%',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    navHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        marginTop: 10,
    },
    backButtonBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    content: {
        padding: 24,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        backgroundColor: '#FFF',
        marginTop: -32,
    },
    categoryPill: {
        backgroundColor: PRIMARY_LIGHT,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    categoryText: {
        color: PRIMARY_COLOR,
        fontWeight: '700',
        fontSize: 13,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        lineHeight: 34,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    metaText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#E5E7EB',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: '#4B5563',
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },
    eventDateBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: PRIMARY_LIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    eventDateMonth: {
        fontSize: 9,
        fontWeight: '700',
        color: PRIMARY_COLOR,
        letterSpacing: 0.5,
    },
    eventDateDay: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
        lineHeight: 20,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    eventMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    eventMetaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    eventPrice: {
        fontSize: 13,
        fontWeight: '700',
        color: PRIMARY_COLOR,
        marginLeft: 8,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    bottomBarBlur: {
        paddingTop: 16,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    joinButton: {
        backgroundColor: PRIMARY_COLOR,
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: Platform.OS === 'android' ? 16 : 0,
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    joinButtonApproved: {
        backgroundColor: '#10B981',
        shadowColor: '#10B981',
    },
    joinButtonPending: {
        backgroundColor: '#F59E0B',
        shadowColor: '#F59E0B',
    },
    joinButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
    },
});
