import React from "react";
import { Modal, Pressable, View } from "react-native";
import { useImmersiveSafeAreaInsets } from "@/components/immersive/edge-to-edge-hero";

export function BottomDrawer({
  children,
  className,
  minHeight = "75%",
  onClose,
  visible,
}: {
  children: React.ReactNode;
  className?: string;
  minHeight?: number | `${number}%`;
  onClose: () => void;
  visible: boolean;
}) {
  const insets = useImmersiveSafeAreaInsets();
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View
          className={className || "bg-white"}
          style={[
            { minHeight, paddingBottom: insets.bottom },
            {
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 10,
            },
          ]}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}
