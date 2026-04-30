import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CompactHeroHeader } from "@/components/tickets/CompactHeroHeader";

export function TransferScaffold({
  children,
  onBack,
  onPrimaryPress,
}: {
  children: React.ReactNode;
  onBack: () => void;
  onPrimaryPress: () => void;
}) {
  return (
    <SafeAreaView edges={["left", "right"]} style={{ flex: 1, backgroundColor: "#F5F2EF" }}>
      <View className="flex-1 bg-[#F5F2EF]">
        <CompactHeroHeader onBack={onBack} onOpenViewer={onPrimaryPress} />
        <View className="flex-1 bg-white">{children}</View>
      </View>
    </SafeAreaView>
  );
}
