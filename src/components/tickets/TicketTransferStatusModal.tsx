import React, { useEffect, useRef } from "react";
import { Animated, Easing, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import type { TransferModal } from "@/components/tickets/ticketFlowTypes";

export function TicketTransferStatusModal({
  frameWidth,
  onRetry,
  onClose,
  status,
}: {
  frameWidth: number;
  onRetry?: () => void;
  onClose?: () => void;
  status: TransferModal;
}) {
  const isVisible = status === "loading" || status === "success" || status === "error";

  // Custom slow spinner — 2400ms per revolution
  const spinAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal animationType="fade" transparent={false} visible={isVisible}>
      <View className="flex-1 items-center bg-white">
        <SafeAreaView
          edges={["top"]}
          style={{ width: "100%", backgroundColor: status === "error" ? "#D93025" : "#0A6AE4" }}
        >
          <View
            className="min-h-[46px] w-full flex-row items-center px-[14px]"
            style={{ maxWidth: frameWidth }}
          >
            <View style={{ minWidth: 42 }} />
            <Text className="flex-1 text-center text-[15.5px] font-bold leading-[18px] text-white">
              {status === "loading" ? "Transferring" : status === "success" ? "Success" : "Error"}
            </Text>
            {status === "error" || status === "success" ? (
               <Pressable onPress={onClose} style={{ minWidth: 42, alignItems: "flex-end" }}>
                  <Ionicons name="close" size={24} color="white" />
               </Pressable>
            ) : (
              <View style={{ minWidth: 42 }} />
            )}
          </View>
        </SafeAreaView>

        <View
          className="flex-1 w-full items-center justify-center bg-white px-6"
          style={{ maxWidth: frameWidth }}
        >
          {status === "loading" && (
            <>
              <Animated.View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  borderWidth: 4,
                  borderColor: "#BFDBFE",
                  borderTopColor: "#0A6AE4",
                  transform: [{ rotate }],
                }}
              />
              <Text className="mt-4 text-[16px] font-medium text-gray-600">
                Processing your transfer...
              </Text>
            </>
          )}

          {status === "success" && (
            <>
              {/* Outer glow ring */}
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: "#E2F6EA",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Inner filled green circle with checkmark */}
                <View
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 34,
                    backgroundColor: "#2EC470",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="checkmark" size={38} color="white" />
                </View>
              </View>

              <Text
                style={{
                  marginTop: 28,
                  fontSize: 22,
                  fontWeight: "800",
                  color: "#111111",
                  textAlign: "center",
                }}
              >
                Tickets Transferred!
              </Text>
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  color: "#5D6773",
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Your tickets have been sent to the recipient.
              </Text>

              <Pressable
                onPress={onClose}
                style={{
                  marginTop: 36,
                  height: 50,
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#000000",
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                  Done
                </Text>
              </Pressable>
            </>
          )}

          {status === "error" && (
            <>
              <View className="h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="alert-circle" size={60} color="#D93025" />
              </View>
              <Text className="mt-6 text-[20px] font-bold text-gray-900 text-center">
                Transfer Failed
              </Text>
              <Text className="mt-2 text-[14px] text-gray-500 text-center">
                Something went wrong. Please try again.
              </Text>
              
              <Pressable
                onPress={onRetry}
                className="mt-10 h-[48px] w-full items-center justify-center bg-black rounded-lg"
              >
                <Text className="text-white font-bold text-[16px]">Retry Transfer</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
