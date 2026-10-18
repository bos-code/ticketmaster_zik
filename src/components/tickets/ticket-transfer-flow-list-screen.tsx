import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { useImmersiveSafeAreaInsets } from '@/components/immersive/edge-to-edge-hero';
import { BottomDock } from '@/components/tickets/ticket-transfer-flow-bottom-dock';
import { TransferLoadingOverlay } from '@/components/tickets/ticket-transfer-flow-loading-overlay';
import {
  CollapsibleEventHero,
  ExtrasPanel,
  PanelTabs,
  TicketListPanel,
} from '@/components/tickets/ticket-transfer-flow-components';
import { HERO_COLLAPSED_HEIGHT, HERO_EXPANDED_HEIGHT } from '@/components/tickets/ticketFlowConstants';
import type { PanelTab } from '@/components/tickets/ticketFlowTypes';

export function TicketTransferListScreen({
  activePanel,
  heroCollapseDistance,
  handleListScroll,
  isHeroCollapsed,
  isLoading = false,
  onBack,
  onOpenTicket,
  onOpenViewer,
  onPanelChange,
  onTransfer,
  scrollY,
}: {
  activePanel: PanelTab;
  heroCollapseDistance?: React.ComponentProps<typeof CollapsibleEventHero>['scrollY'];
  handleListScroll: React.ComponentProps<
    typeof Animated.ScrollView
  >['onScroll'];
  isHeroCollapsed: boolean;
  isLoading?: boolean;
  onBack: () => void;
  onOpenTicket: (ticketIndex: number) => void;
  onOpenViewer: () => void;
  onPanelChange: (value: PanelTab) => void;
  onTransfer: () => void;
  scrollY: React.ComponentProps<typeof CollapsibleEventHero>['scrollY'];
}) {
  const insets = useImmersiveSafeAreaInsets();
  const previewCollapseDistance = useSharedValue(HERO_EXPANDED_HEIGHT - HERO_COLLAPSED_HEIGHT);
  const collapseDistance = heroCollapseDistance ?? previewCollapseDistance;
  const [heroHeight, setHeroHeight] = useState(HERO_EXPANDED_HEIGHT + insets.top);
  const [tabsHeight, setTabsHeight] = useState(60);
  const tabsRef = useRef<View>(null);
  const tabsStyle = useAnimatedStyle(() => ({
    top: heroHeight - Math.min(Math.max(0, scrollY.value), collapseDistance.value),
  }));
  return (
    <View style={{ backgroundColor: '#111111', flex: 1, paddingLeft: insets.left, paddingRight: insets.right }}>
      <View className='flex-1 overflow-hidden bg-[#111111]'>
        <CollapsibleEventHero
          height={heroHeight}
          topInset={insets.top}
          onHeightChange={(height) => { setHeroHeight(height); collapseDistance.value = Math.max(1, height - HERO_COLLAPSED_HEIGHT - insets.top); }}
          collapseDistance={collapseDistance}
          isHeroCollapsed={isHeroCollapsed}
          onBack={onBack}
          onOpenViewer={onOpenViewer}
          scrollY={scrollY}
        />

        <Animated.ScrollView
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 25) + 110,
            paddingTop: heroHeight + tabsHeight,
          }}
          onScroll={handleListScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {activePanel === 'tickets' ? (
            <TicketListPanel onOpenTicket={onOpenTicket} onTransfer={onTransfer} />
          ) : (
            <ExtrasPanel />
          )}
        </Animated.ScrollView>

        <Animated.View onLayout={(event) => setTabsHeight(event.nativeEvent.layout.height)} style={[{ position: 'absolute', left: 0, right: 0, zIndex: 21 }, tabsStyle]}>
          <View ref={tabsRef} collapsable={false}>
            <PanelTabs activePanel={activePanel} onChange={onPanelChange} />
          </View>
        </Animated.View>
        <BottomDock onTransfer={onTransfer} />
        <TransferLoadingOverlay anchorRef={tabsRef} visible={isLoading} />
      </View>
    </View>
  );
}
