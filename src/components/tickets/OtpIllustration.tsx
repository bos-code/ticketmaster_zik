import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { cx } from "@/components/tickets/cx";

export function OtpIllustration() {
  return (
    <View className="relative  items-center justify-center overflow-hidden bg-[#181823]">
      <View className="relative min-h-[88px] min-w-[190px] items-center justify-center rounded-[34px] bg-white px-[22px]">
        <View className="flex-row gap-[7px]">
          {[0, 1, 2, 3].map((index) => (
            <View
              className={cx(
                "h-[34px] w-[34px] items-center justify-center rounded-[6px] bg-[#0A6AE4]",
                index === 3 && "opacity-80",
              )}
              key={index}
            >
              {index < 3 ? (
                <Text className="text-[20px] font-extrabold leading-[22px] text-white">
                  *
                </Text>
              ) : null}
            </View>
          ))}
        </View>
        <View
          className="absolute left-7 h-5 w-5 rounded-bl-[10px] bg-white"
          style={{ bottom: -12, transform: [{ rotate: "32deg" }] }}
        />
      </View>

      <View className="absolute right-[70px] top-[68px]">
        <View
          className="h-5 w-5 self-center border-x-4 border-t-4 border-[#F3C746]"
          style={{
            borderBottomWidth: 0,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
        <View className="-mt-[2px] h-[34px] w-[30px] items-center justify-center rounded-[8px] bg-[#F8D65B]">
          <Ionicons color="#D7A311" name="lock-closed" size={18} />
        </View>
      </View>
    </View>
  );
}
