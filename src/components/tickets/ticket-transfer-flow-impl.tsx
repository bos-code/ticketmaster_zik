import React from 'react';
import { View } from 'react-native';
import { CustomSpinner } from '@/components/tickets/custom-spinner';
import { HERO_EXPANDED_HEIGHT } from '@/components/tickets/ticketFlowConstants';

import { ChooseRecipientTypeScreen } from '@/components/tickets/ChooseRecipientTypeScreen';
import { ChooseTransferMethodScreen } from '@/components/tickets/ChooseTransferMethodScreen';
import { EnterRecipientDetailsScreen } from '@/components/tickets/EnterRecipientDetailsScreen';
import { ReviewTransferScreen } from '@/components/tickets/ReviewTransferScreen';
import { SelectTicketsScreen } from '@/components/tickets/SelectTicketsScreen';
import { TicketTransferAuthModal } from '@/components/tickets/ticket-transfer-flow-auth-modal';
import { TicketsUnavailable } from '@/components/tickets/ticket-transfer-flow-components';
import { TicketFlowContext } from '@/components/tickets/TicketFlowContext';
import { TicketTransferStatusModal } from '@/components/tickets/TicketTransferStatusModal';
import { TicketTransferUnavailableModal } from '@/components/tickets/TicketTransferUnavailableModal';
import { useTicketTransferFlowController } from '@/components/tickets/use-ticket-transfer-flow-controller';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';

const TRANSFER_LOADING_CONTENT_OPACITY = 0.55;
const TRANSFER_LOADING_SPINNER_COLOR = '#2B72D7';
const TRANSFER_LOADING_SPINNER_SIZE = 52;
const TRANSFER_LOADING_SPINNER_TOP_OFFSET = 45;

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
    return <TicketsUnavailable />;
  }

  return (
    <TicketFlowContext.Provider value={flow.ticketFlowData}>
      <View className='flex-1'>
        <Head>
          <meta
            name='theme-color'
            content='#111111'
          />
          <meta
            name='color-scheme'
            content='dark'
          />
          <meta
            name='apple-mobile-web-app-status-bar-style'
            content={!flow.isViewerScreen ? 'black-translucent' : 'black'}
          />
        </Head>
        <StatusBar
          backgroundColor={flow.isViewerScreen ? '#111111' : 'transparent'}
          style='light'
          translucent={!flow.isViewerScreen}
        />
        <View
          className=' flex-1 w-full'
          pointerEvents={flow.isListLoading ? 'none' : 'auto'}
          style={{
            opacity: flow.isListLoading ? TRANSFER_LOADING_CONTENT_OPACITY : 1,
          }}
        >
          {['list', 'select', 'recipientChoice', 'recipientForm'].includes(
            flow.screen,
          ) ? (
            <SelectTicketsScreen
              activePanel={flow.activePanel}
              heroCollapseDistance={flow.heroCollapseDistance}
              handleListScroll={flow.handleListScroll}
              isHeroCollapsed={flow.isHeroCollapsed}
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
              onContinue={() => {
                if (
                  flow.seats.length > 1 &&
                  flow.selectedSeatIds.length < flow.seats.length
                ) {
                  flow.setTransferModal('unavailable');
                } else {
                  flow.setScreen('recipientChoice');
                }
              }}
              onToggleSeat={flow.toggleSeat}
              seatSummary={flow.seatSummary}
              seats={flow.seats}
              selectedSeatIds={flow.selectedSeatIds}
              ticketCount={flow.ticketFlowData.order.ticketCountLabel}
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
          isSubmitting={flow.transferModal === 'authLoading'}
          onCancel={flow.handleCancelAuth}
          onConfirm={flow.handleConfirmCode}
          onOtpChange={flow.setOtpCode}
          otpCode={flow.otpCode}
          visible={
            flow.transferModal === 'auth' ||
            flow.transferModal === 'authLoading'
          }
        />

        <TicketTransferStatusModal
          frameWidth={flow.frameWidth}
          status={flow.transferModal}
          onRetry={flow.handleRetryTransfer}
          onClose={() => flow.setTransferModal('none')}
        />

        <TicketTransferUnavailableModal
          visible={flow.transferModal === 'unavailable'}
          onClose={() => flow.setTransferModal('none')}
          ticketCount={flow.seats.length}
        />

        {flow.isListLoading && (
          <View
            pointerEvents='none'
            style={{
              position: 'absolute',
              top: HERO_EXPANDED_HEIGHT + TRANSFER_LOADING_SPINNER_TOP_OFFSET,
              left: 0,
              right: 0,
              alignItems: 'center',
              zIndex: 999,
              backgroundColor: 'transparent',
            }}
          >
            <CustomSpinner
              color={TRANSFER_LOADING_SPINNER_COLOR}
              size={TRANSFER_LOADING_SPINNER_SIZE}
            />
          </View>
        )}
      </View>
    </TicketFlowContext.Provider>
  );
}
