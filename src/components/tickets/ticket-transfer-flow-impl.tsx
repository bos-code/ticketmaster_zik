import React from "react";
import { View } from "react-native";

import { ChooseRecipientTypeScreen } from "@/components/tickets/ChooseRecipientTypeScreen";
import { ChooseTransferMethodScreen } from "@/components/tickets/ChooseTransferMethodScreen";
import { EnterRecipientDetailsScreen } from "@/components/tickets/EnterRecipientDetailsScreen";
import { ReviewTransferScreen } from "@/components/tickets/ReviewTransferScreen";
import { SelectTicketsScreen } from "@/components/tickets/SelectTicketsScreen";
import { TicketTransferAuthModal } from "@/components/tickets/ticket-transfer-flow-auth-modal";
import { TicketsUnavailable } from "@/components/tickets/ticket-transfer-flow-components";
import { TicketFlowContext } from "@/components/tickets/TicketFlowContext";
import { TicketTransferStatusModal } from "@/components/tickets/TicketTransferStatusModal";
import { useTicketTransferFlowController } from "@/components/tickets/use-ticket-transfer-flow-controller";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function TicketTransferFlow({
  initialScreen = "list",
  initialTicketIndex = 0,
  orderId,
}: {
  initialScreen?: "list" | "viewer";
  initialTicketIndex?: number;
  orderId?: string;
}) {
  const flow = useTicketTransferFlowController({
    initialScreen,
    initialTicketIndex,
    orderId,
  });

  const insets = useSafeAreaInsets();

  if (!flow.ticketFlowData) {
    return <TicketsUnavailable />;
  }

  return (
    <TicketFlowContext.Provider value={flow.ticketFlowData}>
      <View className="flex-1">
        <StatusBar
          backgroundColor={flow.isViewerScreen ? "#F9F8F4" : "transparent"}
          style={flow.isViewerScreen ? "dark" : "light"}
          translucent
        />
        {flow.isViewerScreen ? (
          <View
            pointerEvents="none"
            style={{
              backgroundColor: "#F9F8F4",
              height: insets.top,
              left: 0,
              position: "absolute",
              right: 0,
              top: 0,
              zIndex: 10,
            }}
          />
        ) : null}
        <View className=" flex-1 w-full">
          {["list", "select", "recipientChoice", "recipientForm"].includes(
            flow.screen,
          ) ? (
            <SelectTicketsScreen
              activePanel={flow.activePanel}
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

          {flow.screen === "select" ? (
            <ChooseTransferMethodScreen
              onBack={() => flow.setScreen("list")}
              onContinue={() => flow.setScreen("recipientChoice")}
              onToggleSeat={flow.toggleSeat}
              seatSummary={flow.seatSummary}
              seats={flow.seats}
              selectedSeatIds={flow.selectedSeatIds}
              ticketCount={flow.ticketFlowData.order.ticketCountLabel}
            />
          ) : null}

          {flow.screen === "recipientChoice" ? (
            <ChooseRecipientTypeScreen
              onBack={() => flow.setScreen("select")}
              onManualEntry={() =>
                flow.handleOpenRecipientForm({
                  destination: "",
                  firstName: "",
                  lastName: "",
                  note: "",
                })
              }
              onOpenViewer={flow.handleOpenViewer}
              onSelectContact={flow.handlePickContact}
            />
          ) : null}

          {flow.screen === "recipientForm" ? (
            <EnterRecipientDetailsScreen
              deliveryMode={flow.deliveryMode}
              form={flow.recipientForm}
              formErrors={flow.formErrors}
              onBack={() => flow.setScreen("recipientChoice")}
              onOpenViewer={flow.handleOpenViewer}
              onRequestTransfer={flow.handleRequestTransfer}
              onToggleDeliveryMode={flow.handleToggleDeliveryMode}
              onUpdateForm={flow.updateRecipientForm}
              transferReady={flow.transferReady}
            />
          ) : null}

          {flow.screen === "viewer" ? (
            <ReviewTransferScreen
              carouselCardWidth={flow.carouselCardWidth}
              carouselSnapInterval={flow.carouselSnapInterval}
              onBack={flow.handleViewerBack}
              onViewerIndexChange={flow.setViewerIndex}
              positionLabel={flow.activeTicketDetails.positionLabel}
              seats={flow.transferredSeats}
              viewerIndex={flow.viewerIndex}
            />
          ) : null}
        </View>

        <TicketTransferAuthModal
          confirmCodeReady={flow.confirmCodeReady}
          onCancel={() => flow.setTransferModal("none")}
          onConfirm={flow.handleConfirmCode}
          onOtpChange={flow.setOtpCode}
          otpCode={flow.otpCode}
          visible={flow.transferModal === "auth"}
        />

        <TicketTransferStatusModal
          frameWidth={flow.frameWidth}
          status={flow.transferModal}
          onRetry={flow.handleRetryTransfer}
          onClose={() => flow.setTransferModal("none")}
        />
      </View>
    </TicketFlowContext.Provider>
  );
}
