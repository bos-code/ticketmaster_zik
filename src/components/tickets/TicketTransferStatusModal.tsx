import React from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
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
  const isVisible = status !== "none" && status !== "auth";

  return (
    <Modal animationType="fade" transparent={false} visible={isVisible}>
      <View className="flex-1 items-center bg-white">
        <SafeAreaView
          edges={["top"]}
          style={{ width: "100%", backgroundColor: status === "error" ? "#D93025" : "#0863D9" }}
        >
          <View
            className="min-h-[46px] w-full flex-row items-center px-[14px]"
            style={{ maxWidth: frameWidth }}
          >
            <View style={{ minWidth: 42 }} />
            <Text className="flex-1 text-center text-[15px] font-bold leading-[18px] text-white">
              {status === "loading" ? "Transferring" : status === "success" ? "Success" : "Error"}
            </Text>
            {status === "error" || status === "success" ? (
               <Pressable onPress={onClose} style={{ minWidth: 42 }}>
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
              <ActivityIndicator color="#0863D9" size="large" />
              <Text className="mt-4 text-[16px] font-medium text-gray-600">
                Processing your transfer...
              </Text>
            </>
          )}

          {status === "success" && (
            <>
              <View className="h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <Ionicons name="checkmark-circle" size={60} color="#34A853" />
              </View>
              <Text className="mt-6 text-[20px] font-bold text-gray-900 text-center">
                Tickets Transferred!
              </Text>
              <Text className="mt-2 text-[14px] text-gray-500 text-center">
                Your tickets have been sent to the recipient.
              </Text>
              
              <Pressable
                onPress={onClose}
                className="mt-10 h-[48px] w-full items-center justify-center bg-black rounded-lg"
              >
                <Text className="text-white font-bold text-[16px]">Done</Text>
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
