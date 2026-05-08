import React from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  HERO_EXPANDED_HEIGHT,
} from "@/components/tickets/ticketFlowConstants";
import type { PanelTab } from "@/components/tickets/ticketFlowTypes";
import { BottomDock } from "@/components/tickets/ticket-transfer-flow-bottom-dock";
import {
  CollapsibleEventHero,
  ExtrasPanel,
  PanelTabs,
  TicketListPanel,
} from "@/components/tickets/ticket-transfer-flow-components";

export function TicketTransferListScreen({
  activePanel,
  handleListScroll,
  isHeroCollapsed,
  onBack,
  onOpenTicket,
  onOpenViewer,
  onPanelChange,
  onTransfer,
  scrollY,
}: {
  activePanel: PanelTab;
  handleListScroll: React.ComponentProps<typeof Animated.ScrollView>["onScroll"];
  isHeroCollapsed: boolean;
  onBack: () => void;
  onOpenTicket: (ticketIndex: number) => void;
  onOpenViewer: () => void;
  onPanelChange: (value: PanelTab) => void;
  onTransfer: () => void;
  scrollY: React.ComponentProps<typeof CollapsibleEventHero>["scrollY"];
}) {
  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ backgroundColor: "#FFFFFF", flex: 1 }}
    >
      <View className="flex-1 overflow-hidden bg-white">
        <CollapsibleEventHero
          isHeroCollapsed={isHeroCollapsed}
          onBack={onBack}
          onOpenViewer={onOpenViewer}
          scrollY={scrollY}
        />

        <Animated.ScrollView
          contentContainerStyle={{
            paddingBottom: 132,
            paddingTop: HERO_EXPANDED_HEIGHT,
          }}
          onScroll={handleListScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
        >
          <PanelTabs activePanel={activePanel} onChange={onPanelChange} />

          {activePanel === "tickets" ? (
            <TicketListPanel onOpenTicket={onOpenTicket} />
          ) : (
            <ExtrasPanel />
          )}
        </Animated.ScrollView>

        <BottomDock onTransfer={onTransfer} />
      </View>
    </SafeAreaView>
  );
}
