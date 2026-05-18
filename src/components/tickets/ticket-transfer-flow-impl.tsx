import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { CustomSpinner } from '@/components/tickets/custom-spinner';

import { ChooseRecipientTypeScreen } from '@/components/tickets/ChooseRecipientTypeScreen';
import { ChooseTransferMethodScreen } from '@/components/tickets/ChooseTransferMethodScreen';
import { EnterRecipientDetailsScreen } from '@/components/tickets/EnterRecipientDetailsScreen';
import { ReviewTransferScreen } from '@/components/tickets/ReviewTransferScreen';
import { SelectTicketsScreen } from '@/components/tickets/SelectTicketsScreen';
import { TicketTransferAuthModal } from '@/components/tickets/ticket-transfer-flow-auth-modal';
import {
  TicketsLoadingShadow,
  TicketsUnavailable,
} from '@/components/tickets/ticket-transfer-flow-components';
import { TicketFlowContext } from '@/components/tickets/TicketFlowContext';
import { TicketTransferStatusModal } from '@/components/tickets/TicketTransferStatusModal';
import { useTicketTransferFlowController } from '@/components/tickets/use-ticket-transfer-flow-controller';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';

export function TicketTransferFlow({
  initialScreen = 'list',
  initialTicketIndex = 0,
  orderId,
}: {
  initialScreen?: 'list' | 'viewer';
  initialTicketIndex?: number;
  orderId?: string;
}) {
  const flow = useTicketTransferFlowController({
    initialScreen,
    initialTicketIndex,
    orderId,
  });

  if (!flow.ticketFlowData) {
    if (flow.isLoadingTickets) {
      return <TicketsLoadingShadow />;
    }

    return <TicketsUnavailable />;
  }

  const areStepDrawersVisible = flow.transferModal === 'none';

  return (
    <TicketFlowContext.Provider value={flow.ticketFlowData}>
      <View className='flex-1'>
        <Head>
          <meta
            name='theme-color'
            content={flow.isViewerScreen ? '#F9F8F4' : 'transparent'}
          />
          <meta
            name='color-scheme'
            content={flow.isViewerScreen ? 'light' : 'dark'}
          />
          <meta
            name='apple-mobile-web-app-status-bar-style'
            content={!flow.isViewerScreen ? 'black-translucent' : 'black'}
          />
        </Head>
        <StatusBar
          backgroundColor={flow.isViewerScreen ? '#F9F8F4' : 'transparent'}
          style={flow.isViewerScreen ? 'dark' : 'light'}
          translucent={!flow.isViewerScreen}
        />
        <View
          className=' flex-1 w-full'
          pointerEvents={flow.isListLoading ? 'none' : 'auto'}
          style={{ opacity: flow.isListLoading ? 0.35 : 1 }}
        >
          {['list', 'select', 'recipientChoice', 'recipientForm'].includes(
            flow.screen,
          ) ? (
            <SelectTicketsScreen
              activePanel={flow.activePanel}
              handleListScroll={flow.handleListScroll}
              isHeroCollapsed={flow.isHeroCollapsed}
              isListLoading={flow.isListLoading}
              onBack={flow.handleBackToTabs}
              onOpenTicket={flow.openTicketDetailsRoute}
              onOpenViewer={flow.handleOpenViewer}
              onPanelChange={flow.setActivePanel}
              onTransfer={flow.handleTransferStart}
              scrollY={flow.scrollY}
            />
          ) : null}

          {flow.screen === 'select' ? (
            <ChooseTransferMethodScreen
              onBack={() => flow.setScreen('list')}
              onContinue={() => flow.setScreen('recipientChoice')}
              onToggleSeat={flow.toggleSeat}
              seatSummary={flow.seatSummary}
              seats={flow.seats}
              selectedSeatIds={flow.selectedSeatIds}
              ticketCount={flow.ticketFlowData.order.ticketCountLabel}
              visible={areStepDrawersVisible}
            />
          ) : null}

          {flow.screen === 'recipientChoice' ? (
            <ChooseRecipientTypeScreen
              onBack={() => flow.setScreen('select')}
              onManualEntry={() =>
                flow.handleOpenRecipientForm({
                  destination: '',
                  firstName: '',
                  lastName: '',
                  note: '',
                })
              }
              onOpenViewer={flow.handleOpenViewer}
              onSelectContact={flow.handlePickContact}
              visible={areStepDrawersVisible}
            />
          ) : null}

          {flow.screen === 'recipientForm' ? (
            <EnterRecipientDetailsScreen
              deliveryMode={flow.deliveryMode}
              form={flow.recipientForm}
              formErrors={flow.formErrors}
              onBack={() => flow.setScreen('recipientChoice')}
              onOpenViewer={flow.handleOpenViewer}
              onRequestTransfer={flow.handleRequestTransfer}
              onToggleDeliveryMode={flow.handleToggleDeliveryMode}
              onUpdateForm={flow.updateRecipientForm}
              transferReady={flow.transferReady}
              visible={areStepDrawersVisible}
            />
          ) : null}

          {flow.screen === 'viewer' ? (
            <ReviewTransferScreen
              carouselCardWidth={flow.carouselCardWidth}
              carouselSnapInterval={flow.carouselSnapInterval}
              onBack={flow.handleViewerBack}
              onViewerIndexChange={flow.setViewerIndex}
              seats={flow.transferredSeats}
              viewerIndex={flow.viewerIndex}
            />
          ) : null}
        </View>

        <TicketTransferAuthModal
          confirmCodeReady={flow.confirmCodeReady}
          isLoading={flow.transferModal === 'loading'}
          onCancel={() => flow.setTransferModal('none')}
          onConfirm={flow.handleConfirmCode}
          onOtpChange={flow.setOtpCode}
          otpCode={flow.otpCode}
          visible={flow.transferModal === 'auth' || flow.transferModal === 'loading'}
        />

        <TicketTransferStatusModal
          frameWidth={flow.frameWidth}
          status={flow.transferModal === 'loading' ? 'none' : flow.transferModal}
          onRetry={flow.handleRetryTransfer}
          onClose={() => flow.setTransferModal('none')}
        />

        {flow.isListLoading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999,
              backgroundColor: 'transparent',
            }}
          >
            <CustomSpinner color="#80858E" size={26} />
          </View>
        )}
      </View>
    </TicketFlowContext.Provider>
  );
}
