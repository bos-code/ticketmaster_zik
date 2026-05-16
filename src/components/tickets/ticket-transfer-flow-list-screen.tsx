import React from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { useImmersiveSafeAreaInsets } from "@/components/immersive/edge-to-edge-hero";
import { BottomDock } from "@/components/tickets/ticket-transfer-flow-bottom-dock";
import {
  CollapsibleEventHero,
  ExtrasPanel,
  PanelTabs,
  TicketListPanel,
} from "@/components/tickets/ticket-transfer-flow-components";
import { HERO_EXPANDED_HEIGHT } from "@/components/tickets/ticketFlowConstants";
import type { PanelTab } from "@/components/tickets/ticketFlowTypes";

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
  handleListScroll: React.ComponentProps<
    typeof Animated.ScrollView
  >["onScroll"];
  isHeroCollapsed: boolean;
  onBack: () => void;
  onOpenTicket: (ticketIndex: number) => void;
  onOpenViewer: () => void;
  onPanelChange: (value: PanelTab) => void;
  onTransfer: () => void;
  scrollY: React.ComponentProps<typeof CollapsibleEventHero>["scrollY"];
}) {
  const insets = useImmersiveSafeAreaInsets();

  return (
    <View style={{ backgroundColor: "#FFFFFF", flex: 1 }}>
      <View className="flex-1 overflow-hidden bg-white">
        <CollapsibleEventHero
          isHeroCollapsed={isHeroCollapsed}
          onBack={onBack}
          onOpenViewer={onOpenViewer}
          scrollY={scrollY}
        />

        <Animated.ScrollView
          contentContainerStyle={{
            paddingBottom: 132 + insets.bottom,
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
    </View>
  );
}
