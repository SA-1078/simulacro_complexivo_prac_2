/**
 * ============================================================================
 * COMPONENTE NATIVO: RADIO GROUP (SELECCIÓN SIMPLE TIPO OPTION)
 * ============================================================================
 * Implementado con Pressable y StyleSheet nativo para cumplir con los
 * requerimientos de componentes interactivos del examen.
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

// Opción genérica para el grupo de radio buttons
export type RadioOption<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  label?: string;                     // Etiqueta superior del grupo
  value: T;                           // Valor seleccionado actualmente
  onChange: (value: T) => void;       // Callback al cambiar de opción
  options: RadioOption<T>[];          // Lista de opciones disponibles
};

export default function RadioGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: Props<T>) {
  return (
    <View style={styles.wrap}>
      {/* Etiqueta de la sección */}
      {!!label && <Text style={styles.label}>{label}</Text>}

      {/* Renderizado de cada botón de radio */}
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={styles.row}
          >
            {/* Círculo exterior del radio */}
            <View style={[styles.outer, isSelected && styles.outerSelected]}>
              {/* Punto interior si está seleccionado */}
              {isSelected && <View style={styles.inner} />}
            </View>
            {/* Texto descriptivo de la opción */}
            <Text style={styles.text}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  label: {
    color: "#8b949e",
    marginBottom: 6,
    marginTop: 6,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  outer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#30363d",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#161b22",
  },
  outerSelected: {
    borderColor: "#58a6ff",
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#58a6ff",
  },
  text: {
    color: "#c9d1d9",
    fontWeight: "700",
  },
});
