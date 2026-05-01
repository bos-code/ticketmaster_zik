import React from "react";
import { Text, TextInput, View } from "react-native";
import { cx } from "@/components/tickets/cx";

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
  return (
    <View className="mb-[10px] gap-[2px]">
      <Text className="text-[10.5px] font-bold leading-[12px] text-[#111111]">
        {label}
      </Text>
      <TextInput
        className={cx(
          "min-h-[32px] border border-[#333333] px-[8px] py-1 text-[13px] font-medium text-[#111111] bg-white",
          error && "border-[#FF0000]"
        )}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        value={value}
      />
      {error ? (
        <Text className="text-[10px] font-medium text-[#FF0000]">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
