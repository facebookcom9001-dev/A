import { Feather } from "@expo/vector-icons";
import { useGetFeaturedListings, useGetRecentListings } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { ListingCard } from "@/components/ListingCard";
import { SectionGrid } from "@/components/SectionGrid";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: featured, isLoading: featLoading } = useGetFeaturedListings();
  const { data: recent, isLoading: recentLoading } = useGetRecentListings();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSearchSubmit = () => {
    if (search.trim()) {
      router.push({ pathname: "/(tabs)/browse", params: { q: search.trim() } });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.logo, { color: colors.primary }]}>يو شوب</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>سوق الطلاب الجامعيين</Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/profile")}
          style={[styles.avatarBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="user" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Search bar */}
      <Pressable
        onPress={() => router.push("/(tabs)/browse")}
        style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
          ابحث عن كتاب، منتج، وظيفة...
        </Text>
      </Pressable>

      {/* Sections */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>الأقسام</Text>
      <SectionGrid />

      {/* Featured */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>
        المميزة
      </Text>
      {featLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
      ) : !featured?.length ? (
        <EmptyState icon="star" title="لا توجد إعلانات مميزة" />
      ) : (
        <FlatList
          data={featured}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={{ width: 180, marginLeft: 12 }}>
              <ListingCard listing={item} compact />
            </View>
          )}
          contentContainerStyle={{ paddingRight: 12 }}
          scrollEnabled={!!featured?.length}
        />
      )}

      {/* Recent */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>
        أحدث الإعلانات
      </Text>
      {recentLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
      ) : !recent?.length ? (
        <EmptyState icon="inbox" title="لا توجد إعلانات حديثة" />
      ) : (
        recent.map((item) => <ListingCard key={item.id} listing={item} />)
      )}

      <View style={{ height: Platform.OS === "web" ? 100 : 90 + insets.bottom }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    fontSize: 26,
    fontWeight: "900",
    fontFamily: "Tajawal_900Black",
  },
  tagline: {
    fontSize: 12,
    fontFamily: "Tajawal_400Regular",
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 24,
  },
  searchPlaceholder: {
    fontSize: 14,
    fontFamily: "Tajawal_400Regular",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "Tajawal_700Bold",
    marginBottom: 12,
  },
});
