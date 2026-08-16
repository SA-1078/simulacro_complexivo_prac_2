/**
 * ============================================================================
 * COMPONENTE NATIVO: CHECKBOX ROW (CASILLA DE VERIFICACIÓN PERSONALIZADA)
 * ============================================================================
 * Implementado usando Pressable, ya que React Native core no incluye checkbox.
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type Props = {
  label: string;                        // Texto que acompaña al checkbox
  checked: boolean;                     // Estado booleano de selección
  onChange: (value: boolean) => void;   // Callback disparado al presionar
};

export default function CheckboxRow({ label, checked, onChange }: Props) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={styles.row}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      {/* Caja de verificación con animación/estilo de marcado */}
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Text style={styles.tick}>✓</Text>}
      </View>
      {/* Texto de la etiqueta */}
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#30363d",
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  boxChecked: {
    borderColor: "#58a6ff",
    backgroundColor: "#1f6feb",
  },
  tick: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 14,
    lineHeight: 16,
  },
  text: {
    color: "#c9d1d9",
    fontWeight: "600",
    flex: 1,
  },
});
