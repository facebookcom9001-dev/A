import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: Props) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Feather name={icon as any} size={48} color={colors.mutedForeground} />
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Tajawal_700Bold",
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    fontFamily: "Tajawal_400Regular",
    textAlign: "center",
  },
});
