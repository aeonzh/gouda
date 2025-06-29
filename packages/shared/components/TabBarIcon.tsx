import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleProp, ViewStyle } from "react-native";

interface TabBarIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  style?: StyleProp<ViewStyle>;
}

export function TabBarIcon(props: TabBarIconProps) {
  return (
    <Ionicons
      size={28}
      style={[{ marginBottom: -3 }, props.style]}
      {...props}
    />
  );
}
