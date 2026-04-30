import React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { BackLink } from "@/components/tickets/BackLink";
import { cx } from "@/components/tickets/cx";
import { Field } from "@/components/tickets/Field";
import type { DeliveryMode, RecipientFormState } from "@/components/tickets/ticketFlowTypes";
import { TransferScaffold } from "@/components/tickets/TransferScaffold";

export function TicketTransferRecipientFormScreen({
  deliveryMode,
  form,
  onBack,
  onOpenViewer,
  onRequestTransfer,
  onToggleDeliveryMode,
  onUpdateForm,
  transferReady,
}: {
  deliveryMode: DeliveryMode;
  form: RecipientFormState;
  onBack: () => void;
  onOpenViewer: () => void;
  onRequestTransfer: () => void;
  onToggleDeliveryMode: () => void;
  onUpdateForm: (field: keyof RecipientFormState, value: string) => void;
  transferReady: boolean;
}) {
  const recipientLabel = deliveryMode === "email" ? "Email" : "Mobile Number";
  const recipientPlaceholder =
    deliveryMode === "email" ? "Enter Email Address" : "Enter Mobile Number";

  return (
    <TransferScaffold onBack={onBack} onPrimaryPress={onOpenViewer}>
      <ScrollView
        contentContainerStyle={{
          gap: 10,
          paddingHorizontal: 14,
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View className="mb-2 h-[3px] w-6 bg-[#121212]" />
        <Text className="mb-2 text-[14px] font-extrabold leading-[18px] text-[#1F1F1F]">
          RECIPIENT DETAILS
        </Text>

        <Field
          label="First Name"
          onChangeText={(value) => onUpdateForm("firstName", value)}
          placeholder="First Name"
          value={form.firstName}
        />
        <Field
          label="Last Name"
          onChangeText={(value) => onUpdateForm("lastName", value)}
          placeholder="Last Name"
          value={form.lastName}
        />
        <Field
          keyboardType={deliveryMode === "email" ? "email-address" : "phone-pad"}
          label={recipientLabel}
          onChangeText={(value) => onUpdateForm("destination", value)}
          placeholder={recipientPlaceholder}
          value={form.destination}
        />

        <Pressable
          accessibilityRole="button"
          onPress={onToggleDeliveryMode}
          className="self-start"
        >
          <Text className="text-[12px] font-medium leading-[14px] text-[#4B92BF] underline">
            {deliveryMode === "email"
              ? "Use Mobile Number instead"
              : "Use Email instead"}
          </Text>
        </Pressable>

        <View className="gap-[6px]">
          <Text className="text-[12px] font-semibold leading-[14px] text-[#171717]">
            Note
          </Text>
          <TextInput
            multiline
            numberOfLines={5}
            onChangeText={(value) => onUpdateForm("note", value)}
            style={{ minHeight: 98, textAlignVertical: "top" }}
            className="border border-[#C9CCD2] px-[10px] py-2 text-[14px] text-[#111111]"
            value={form.note}
          />
        </View>
      </ScrollView>

      <View className="flex-row items-center justify-between px-[14px] pb-[30px] pt-5">
        <BackLink onPress={onBack} />

        <Pressable
          accessibilityRole="button"
          disabled={!transferReady}
          onPress={onRequestTransfer}
          className={cx(
            "h-10 items-center justify-center rounded-[5px] bg-[#050505] px-[22px]",
            !transferReady && "opacity-35",
          )}
        >
          <Text className="text-[12px] font-semibold leading-[14px] text-white">
            Transfer Tickets
          </Text>
        </Pressable>
      </View>
    </TransferScaffold>
  );
}
