import React from "react";
import { ActivityIndicator, Modal, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function TicketTransferLoadingModal({
  frameWidth,
  visible,
}: {
  frameWidth: number;
  visible: boolean;
}) {
  return (
    <Modal animationType="fade" transparent={false} visible={visible}>
      <View className="flex-1 items-center bg-white">
        <SafeAreaView
          edges={["top"]}
          style={{ width: "100%", backgroundColor: "#0863D9" }}
        >
          <View
            className="min-h-[46px] w-full flex-row items-center bg-[#0863D9] px-[14px]"
            style={{ maxWidth: frameWidth }}
          >
            <View style={{ minWidth: 42 }} />
            <Text className="flex-1 text-center text-[15px] font-bold leading-[18px] text-white">
              Authentication
            </Text>
            <View style={{ minWidth: 42 }} />
          </View>
        </SafeAreaView>

        <View
          className="flex-1 w-full items-center justify-center bg-white"
          style={{ maxWidth: frameWidth }}
        >
          <ActivityIndicator color="#75A9E8" size="large" />
        </View>
      </View>
    </Modal>
  );
}
