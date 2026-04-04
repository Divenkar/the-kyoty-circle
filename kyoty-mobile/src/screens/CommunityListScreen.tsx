import React, { useEffect, useState, useMemo } from 'react';
import {
    StyleSheet, Text, View, FlatList, TouchableOpacity,
    Image, ActivityIndicator, SafeAreaView, Platform,
    StatusBar, TextInput, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
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

export default function CommunityListScreen() {
    const navigation = useNavigation<any>();
    const { getToken } = useClerkAuth();
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState<string | null>(null);

    useEffect(() => {
        fetchCommunities();
    }, []);

    const fetchCommunities = async () => {
        try {
            const token = await getToken({ template: 'supabase' }).catch(() => null)
                ?? await getToken().catch(() => null);
            const supabase = createSupabaseClient(token);

            const { data } = await supabase
                .from('communities')
                .select('*, cities(name)')
                .in('status', ['active', 'approved'])
                .order('member_count', { ascending: false });

            if (data) {
                setCommunities(data as Community[]);
            }
        } catch (e) {
            console.error('Error fetching communities:', e);
        } finally {
            setLoading(false);
        }
    };

    const cities = useMemo(() => {
        const citySet = new Set<string>();
        communities.forEach((c) => {
            if (c.cities?.name) citySet.add(c.cities.name);
        });
        return Array.from(citySet).sort();
    }, [communities]);

    const filteredCommunities = useMemo(() => {
        let result = communities;

        if (selectedCity) {
            result = result.filter((c) => c.cities?.name === selectedCity);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((c) =>
                c.name.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q) ||
                c.category?.toLowerCase().includes(q)
            );
        }

        return result;
    }, [communities, selectedCity, searchQuery]);

    const handleCommunityPress = async (community: Community) => {
        if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        navigation.navigate('CommunityDetail', { communityId: community.id });
    };

    const defaultCover = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop';

    const renderCommunityCard = ({ item }: { item: Community }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => handleCommunityPress(item)}
        >
            <Image
                source={{ uri: item.cover_image_url ?? defaultCover }}
                style={styles.cardImage}
            />
            <View style={styles.cardContent}>
                {item.category && (
                    <View style={styles.categoryPill}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                )}
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                {item.cities?.name && (
                    <View style={styles.metaRow}>
                        <Ionicons name="location-outline" size={13} color="#6B7280" />
                        <Text style={styles.metaText}>{item.cities.name}</Text>
                    </View>
                )}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="people-outline" size={14} color={PRIMARY_COLOR} />
                        <Text style={styles.statText}>{item.member_count}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="star-outline" size={14} color={PRIMARY_COLOR} />
                        <Text style={styles.statText}>{Number(item.rating_avg).toFixed(1)}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Communities</Text>
                <Text style={styles.headerSubtitle}>Find your people</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search communities..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                )}
            </View>

            {/* City Filter Pills */}
            {cities.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.pillsContainer}
                >
                    <TouchableOpacity
                        style={[styles.pill, !selectedCity && styles.pillActive]}
                        onPress={() => setSelectedCity(null)}
                    >
                        <Text style={[styles.pillText, !selectedCity && styles.pillTextActive]}>All</Text>
                    </TouchableOpacity>
                    {cities.map((city) => (
                        <TouchableOpacity
                            key={city}
                            style={[styles.pill, selectedCity === city && styles.pillActive]}
                            onPress={() => setSelectedCity(selectedCity === city ? null : city)}
                        >
                            <Text style={[styles.pillText, selectedCity === city && styles.pillTextActive]}>
                                {city}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Community List */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                    <Text style={styles.loadingText}>Finding communities...</Text>
                </View>
            ) : filteredCommunities.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No communities found</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredCommunities}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCommunityCard}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
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
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    emptyText: {
        fontSize: 15,
        color: '#9CA3AF',
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
        marginBottom: 4,
        borderRadius: 12,
        paddingHorizontal: 14,
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
    pillsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: 8,
    },
    pillActive: {
        backgroundColor: PRIMARY_COLOR,
        borderColor: PRIMARY_COLOR,
    },
    pillText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    pillTextActive: {
        color: '#FFF',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 140,
    },
    cardContent: {
        padding: 16,
    },
    categoryPill: {
        backgroundColor: PRIMARY_LIGHT,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '700',
        color: PRIMARY_COLOR,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 6,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    metaText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
    },
});
