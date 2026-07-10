import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { BottomDock } from '@/components/tickets/ticket-transfer-flow-bottom-dock';
import {
  CollapsibleEventHero,
  ExtrasPanel,
  PanelTabs,
  TicketListPanel,
} from '@/components/tickets/ticket-transfer-flow-components';
import type { PanelTab } from '@/components/tickets/ticketFlowTypes';

export function TicketTransferListScreen({
  activePanel,
  handleListScroll,
  heroExpandedHeight,
  isHeroCollapsed,
  onBack,
  onHeroExpandedHeightChange,
  onOpenTicket,
  onOpenViewer,
  onPanelChange,
  onTransfer,
  scrollY,
}: {
  activePanel: PanelTab;
  handleListScroll: React.ComponentProps<
    typeof Animated.ScrollView
  >['onScroll'];
  heroExpandedHeight: number;
  isHeroCollapsed: boolean;
  onBack: () => void;
  onHeroExpandedHeightChange: (height: number) => void;
  onOpenTicket: (ticketIndex: number) => void;
  onOpenViewer: () => void;
  onPanelChange: (value: PanelTab) => void;
  onTransfer: () => void;
  scrollY: React.ComponentProps<typeof CollapsibleEventHero>['scrollY'];
}) {
  return (
    <View style={{ backgroundColor: '#FFFFFF', flex: 1 }}>
      <View className='flex-1 overflow-hidden bg-white'>
        <CollapsibleEventHero
          expandedHeight={heroExpandedHeight}
          isHeroCollapsed={isHeroCollapsed}
          onBack={onBack}
          onExpandedHeightChange={onHeroExpandedHeightChange}
          onOpenViewer={onOpenViewer}
          scrollY={scrollY}
        />

        <Animated.ScrollView
          contentContainerStyle={{
            paddingBottom: 132,
            paddingTop: heroExpandedHeight,
          }}
          onScroll={handleListScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
        >
          <PanelTabs activePanel={activePanel} onChange={onPanelChange} />

          {activePanel === 'tickets' ? (
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
