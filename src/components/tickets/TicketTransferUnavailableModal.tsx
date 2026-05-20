import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomDrawer } from "@/components/ui/bottom-drawer";
import { fonts } from "../../../theme/fonts";

interface TicketTransferUnavailableModalProps {
  visible: boolean;
  onClose: () => void;
  ticketCount?: number;
}

export function TicketTransferUnavailableModal({
  visible,
  onClose,
  ticketCount = 3,
}: TicketTransferUnavailableModalProps) {
  return (
    <BottomDrawer
      minHeight="42%"
      onClose={onClose}
      visible={visible}
      className="bg-white rounded-t-[20px] overflow-hidden"
    >
      {/* Top Header with Close Button */}
      <View className="w-full flex-row justify-end px-[18px] pt-[18px]">
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={onClose}
          className="items-center justify-center w-[32px] h-[32px]"
        >
          <Ionicons name="close" size={26} color="#70757E" />
        </Pressable>
      </View>

      {/* Main Content Body */}
      <View className="flex-1 items-center px-[32px] pt-[8px] pb-[32px]">
        {/* Info Circle Icon */}
        <View className="w-[48px] h-[48px] rounded-full bg-[#8E95A5] items-center justify-center mb-5">
          <Text 
            style={{ fontFamily: fonts.bold }}
            className="text-white text-[26px] leading-[32px] text-center"
          >
            i
          </Text>
        </View>

        {/* Title */}
        <Text 
          style={{ fontFamily: fonts.bold }}
          className="text-[20px] text-[#111111] text-center tracking-tight mb-3"
        >
          Transfer Unavailable
        </Text>

        {/* Message */}
        <Text 
          style={{ fontFamily: fonts.medium }}
          className="text-[14px] leading-[20px] text-[#444B55] text-center mb-8 px-2"
        >
          Unfortunately, Transfer is not available at the moment. To make your transfer successful, you need to transfer all {ticketCount} tickets at once.
        </Text>

        {/* OK Button */}
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          className="w-full h-[46px] bg-[#0214C7] rounded-[4px] items-center justify-center active:bg-[#010e9c]"
        >
          <Text 
            style={{ fontFamily: fonts.bold }}
            className="text-white text-[15px] text-center"
          >
            Ok
          </Text>
        </Pressable>
      </View>
    </BottomDrawer>
  );
}
