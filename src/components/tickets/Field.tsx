import React from "react";
import { Text, TextInput, View } from "react-native";

export function Field({
  keyboardType,
  label,
  onChangeText,
  placeholder,
  value,
}: {
  keyboardType?: "default" | "email-address" | "phone-pad";
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View className="gap-[6px]">
      <Text className="text-[12px] font-semibold leading-[14px] text-[#171717]">
        {label}
      </Text>
      <TextInput
        className="min-h-[36px] border border-[#C9CCD2] px-[10px] py-2 text-[14px] text-[#111111]"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#C4C8CE"
        value={value}
      />
    </View>
  );
}
