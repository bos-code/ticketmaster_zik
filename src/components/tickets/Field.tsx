import { Text, TextInput } from '@/components/ui/app-text';
import React from "react";
import { View } from "react-native";
import { useDrawerTheme } from "@/components/ui/drawer-theme";

export function Field({
  error,
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  error?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const { colors } = useDrawerTheme();

  return (
    <View className="mb-[10px] gap-[2px]">
      <Text className="text-[10.5px] font-bold leading-[12px]" style={{ color: colors.text }}>
        {label}
      </Text>
      <TextInput
        className="min-h-[32px] border px-[8px] py-1 text-[13px] font-medium"
        style={{ backgroundColor: colors.sheetRaised, borderColor: error ? colors.error : colors.inputBorder, color: colors.text }}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
      />
      {error ? (
        <Text className="text-[10px] font-medium" style={{ color: colors.error }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
