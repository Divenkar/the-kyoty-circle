import React, { useState, useCallback } from 'react';
import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    ActivityIndicator, SafeAreaView, Platform, StatusBar,
    TextInput, SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { createSupabaseClient } from '../lib/supabase';

const PRIMARY_COLOR = '#6C47FF';
const PRIMARY_LIGHT = '#F5F3FF';
const BG_COLOR = '#F8FAFC';

interface CommunityResult {
    id: number;
    name: string;
    slug: string;
    category: string | null;
    member_count: number;
    cities: { name: string } | null;
}

interface EventResult {
    id: number;
    title: string;
    location_text: string;
    date: string;
    price_per_person: number | null;
    communities: { name: string } | null;
}

export default function SearchScreen() {
    const navigation = useNavigation<any>();
    const { getToken } = useClerkAuth();
    const [query, setQuery] = useState('');
    const [communities, setCommunities] = useState<CommunityResult[]>([]);
    const [events, setEvents] = useState<EventResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const performSearch = useCallback(async (searchQuery: string) => {
        const trimmed = searchQuery.trim();
        if (!trimmed) {
            setCommunities([]);
            setEvents([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);

        try {
            const token = await getToken({ template: 'supabase' }).catch(() => null)
                ?? await getToken().catch(() => null);
            const supabase = createSupabaseClient(token);

            const pattern = `%${trimmed}%`;

            const [communityRes, eventRes] = await Promise.all([
                supabase
                    .from('communities')
                    .select('id, name, slug, category, member_count, cities(name)')
                    .in('status', ['active', 'approved'])
                    .or(`name.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`)
                    .limit(20),
                supabase
                    .from('events')
                    .select('id, title, location_text, date, price_per_person, communities:community_id(name)')
                    .in('status', ['approved', 'open', 'full'])
                    .or(`title.ilike.${pattern},location_text.ilike.${pattern},description.ilike.${pattern}`)
                    .limit(20),
            ]);

            setCommunities((communityRes.data ?? []) as CommunityResult[]);
            setEvents((eventRes.data ?? []) as EventResult[]);
        } catch (e) {
            console.error('Search error:', e);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    const handleSearch = () => {
        performSearch(query);
    };

    const handleCommunityPress = async (community: CommunityResult) => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        navigation.navigate('CommunityDetail', { communityId: community.id });
    };

    const handleEventPress = async (event: EventResult) => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        navigation.navigate('EventDetail', {
            event: {
                ...event,
                image_placeholder: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop',
            },
        });
    };

    const sections = [];
    if (communities.length > 0) {
        sections.push({
            title: 'Communities',
            data: communities.map((c) => ({ type: 'community' as const, item: c })),
        });
    }
    if (events.length > 0) {
        sections.push({
            title: 'Events',
            data: events.map((e) => ({ type: 'event' as const, item: e })),
        });
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Search</Text>
                <Text style={styles.headerSubtitle}>Find communities and events</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for anything..."
                    placeholderTextColor="#94A3B8"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    autoCapitalize="none"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => { setQuery(''); setCommunities([]); setEvents([]); setHasSearched(false); }}>
                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Results */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            ) : !hasSearched ? (
                <View style={styles.center}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="search" size={48} color="#D1D5DB" />
                    </View>
                    <Text style={styles.emptyTitle}>Discover something new</Text>
                    <Text style={styles.emptyText}>Search for communities, events, and more</Text>
                </View>
            ) : sections.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="sad-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>No results found</Text>
                    <Text style={styles.emptyText}>Try a different search term</Text>
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item, index) => `${item.type}-${item.type === 'community' ? (item.item as CommunityResult).id : (item.item as EventResult).id}-${index}`}
                    renderSectionHeader={({ section }) => (
                        <View style={styles.sectionHeader}>
                            <Ionicons
                                name={section.title === 'Communities' ? 'people' : 'calendar'}
                                size={16}
                                color={PRIMARY_COLOR}
                            />
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <Text style={styles.sectionCount}>{section.data.length}</Text>
                        </View>
                    )}
                    renderItem={({ item }) => {
                        if (item.type === 'community') {
                            const c = item.item as CommunityResult;
                            return (
                                <TouchableOpacity
                                    style={styles.resultCard}
                                    onPress={() => handleCommunityPress(c)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.resultIcon}>
                                        <Ionicons name="people" size={20} color={PRIMARY_COLOR} />
                                    </View>
                                    <View style={styles.resultInfo}>
                                        <Text style={styles.resultTitle} numberOfLines={1}>{c.name}</Text>
                                        <Text style={styles.resultMeta}>
                                            {[c.category, c.cities?.name, `${c.member_count} members`].filter(Boolean).join(' · ')}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                                </TouchableOpacity>
                            );
                        } else {
                            const e = item.item as EventResult;
                            return (
                                <TouchableOpacity
                                    style={styles.resultCard}
                                    onPress={() => handleEventPress(e)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.resultIcon, { backgroundColor: '#F0FDF4' }]}>
                                        <Ionicons name="calendar" size={20} color="#10B981" />
                                    </View>
                                    <View style={styles.resultInfo}>
                                        <Text style={styles.resultTitle} numberOfLines={1}>{e.title}</Text>
                                        <Text style={styles.resultMeta}>
                                            {[
                                                e.communities?.name,
                                                e.location_text,
                                                new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                                            ].filter(Boolean).join(' · ')}
                                        </Text>
                                    </View>
                                    <Text style={styles.resultPrice}>
                                        {e.price_per_person ? `₹${e.price_per_person}` : 'Free'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }
                    }}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_COLOR,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 40,
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 8,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: PRIMARY_COLOR,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
        fontWeight: '500',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        borderRadius: 12,
        paddingLeft: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: '#0F172A',
    },
    searchButton: {
        backgroundColor: PRIMARY_COLOR,
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 4,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#374151',
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
        textAlign: 'center',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        flex: 1,
    },
    sectionCount: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    resultCard: {
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
    resultIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: PRIMARY_LIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    resultInfo: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 2,
    },
    resultMeta: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    resultPrice: {
        fontSize: 13,
        fontWeight: '700',
        color: PRIMARY_COLOR,
        marginLeft: 8,
    },
});
