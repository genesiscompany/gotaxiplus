import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, useColorScheme, Alert, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "http://localhost:8080/api";

export const SEGMENTO_NAV_HEIGHT = 60;

type Tab = "inicio" | "carrinho" | "finalizar";

type Props = {
  ativo?: Tab;
  onInicio?: () => void;
  onCarrinho?: () => void;
  onFinalizar?: () => void;
  qtdCarrinho?: number;
  corAtivo?: string;
};

export default function SegmentoBottomNav({
  ativo = "inicio",
  onInicio,
  onCarrinho,
  onFinalizar,
  qtdCarrinho = 0,
  corAtivo = "#22C55E",
}: Props) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const [suporteNumero, setSuporteNumero] = useState("5511900000000");

  useEffect(() => {
    fetch(`${API_BASE}/public/config`)
      .then(r => r.json())
      .then(d => { if (d?.whatsapp_suporte) setSuporteNumero(d.whatsapp_suporte); })
      .catch(() => {});
  }, []);

  const handleSuporte = () => {
    const msg = encodeURIComponent("Olá! Preciso de ajuda com o app GoTaxi.");
    Linking.openURL(`https://wa.me/${suporteNumero}?text=${msg}`).catch(() =>
      Alert.alert("WhatsApp não encontrado", "Instale o WhatsApp para falar com o suporte.")
    );
  };

  const TABS = [
    { id: "inicio" as Tab, label: "Inicial", icone: "home" as const, onPress: onInicio },
    { id: "carrinho" as Tab, label: "Carrinho", icone: "shopping-cart" as const, onPress: onCarrinho, badge: qtdCarrinho },
    { id: "finalizar" as Tab, label: "Finalizar", icone: "check-circle" as const, onPress: onFinalizar },
    { id: "suporte" as const, label: "Suporte", icone: "message-circle" as const, onPress: handleSuporte },
  ];

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom + 4,
      }
    ]}>
      {TABS.map(tab => {
        const isActive = tab.id !== "suporte" && tab.id === ativo;
        const isSuporte = tab.id === "suporte";
        const color = isSuporte ? "#25D366" : isActive ? corAtivo : colors.tabIconDefault;

        return (
          <Pressable
            key={tab.id}
            style={styles.tab}
            onPress={tab.onPress}
          >
            <View style={styles.iconWrap}>
              <Feather name={tab.icone} size={21} color={color} />
              {tab.id === "carrinho" && (tab.badge ?? 0) > 0 && (
                <View style={[styles.badge, { backgroundColor: corAtivo }]}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.label,
              {
                color,
                fontFamily: isActive ? "Inter_600SemiBold" : "Inter_400Regular",
              }
            ]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: 4,
  },
  iconWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  label: {
    fontSize: 10,
    textAlign: "center",
  },
});
