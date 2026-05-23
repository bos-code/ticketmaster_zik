import React from "react";
import { Modal, Pressable, View } from "react-native";

export function BottomDrawer({
  backdropColor = "rgba(0,0,0,0.6)",
  children,
  className,
  minHeight = "75%",
  onClose,
  visible,
}: {
  backdropColor?: string;
  children: React.ReactNode;
  className?: string;
  minHeight?: number | `${number}%`;
  onClose: () => void;
  visible: boolean;
}) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: backdropColor }}>
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View
          className={className || "bg-white rounded-t-[20px] overflow-hidden"}
          style={[
            { minHeight },
            {
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 10,
            },
          ]}
        >
          {/* Drag Handle Indicator */}
          <View className="items-center pt-[12px] pb-[6px]">
            <View className="h-[4.5px] w-[38px] rounded-full bg-[#CCCCCC]" />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
