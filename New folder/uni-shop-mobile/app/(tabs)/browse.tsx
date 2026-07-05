import { Feather } from "@expo/vector-icons";
import { useGetListings } from "@workspace/api-client-react";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { ListingCard } from "@/components/ListingCard";
import { SECTIONS } from "@/constants/sections";
import { useColors } from "@/hooks/useColors";

const ALL_SECTIONS = [{ key: "", label: "الكل", icon: "grid", color: "#FF4D1A" }, ...SECTIONS];

export default function BrowseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string; section?: string }>();

  const [search, setSearch] = useState(params.q ?? "");
  const [activeSection, setActiveSection] = useState(params.section ?? "");

  const { data: listings, isLoading, refetch } = useGetListings({
    search: search || undefined,
    category: activeSection || undefined,
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="ابحث..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            textAlign="right"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Section filter chips */}
      <FlatList
        horizontal
        data={ALL_SECTIONS}
        keyExtractor={(s) => s.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        renderItem={({ item }) => {
          const active = activeSection === item.key;
          return (
            <TouchableOpacity
              onPress={() => setActiveSection(active ? "" : item.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? colors.primaryForeground : colors.foreground },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Results */}
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={listings ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 16 }}>
              <ListingCard listing={item} />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState icon="search" title="لا توجد نتائج" subtitle="جرب كلمة بحث مختلفة" />
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: Platform.OS === "web" ? 100 : 90 + insets.bottom }}
          onRefresh={refetch}
          refreshing={isLoading}
          scrollEnabled={!!(listings?.length)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Tajawal_400Regular",
  },
  chips: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Tajawal_700Bold",
  },
});
