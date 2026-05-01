import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { cx } from "@/components/tickets/cx";
import { Field } from "@/components/tickets/Field";
import type { DeliveryMode, RecipientFormState } from "@/components/tickets/ticketFlowTypes";
import { BottomDrawer } from "@/components/ui/bottom-drawer";

import { Ionicons } from "@expo/vector-icons";

export function TicketTransferRecipientFormScreen({
  deliveryMode,
  form,
  formErrors = {},
  onBack,
  onRequestTransfer,
  onToggleDeliveryMode,
  onUpdateForm,
  transferReady,
}: {
  deliveryMode: DeliveryMode;
  form: RecipientFormState;
  formErrors?: Partial<RecipientFormState>;
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
    <BottomDrawer minHeight="62%" onClose={onBack} visible={true}>
      <View className="flex-1 px-[20px] pt-4">
        <Text className="mb-4 text-left text-base tracking-[0.6px] font-black text-black uppercase">
          RECIPIENT DETAILS
        </Text>

        <View
          className="flex-1"
        >
          <Field
            label="First Name"
            error={formErrors.firstName}
            onChangeText={(value) => onUpdateForm("firstName", value)}
            placeholder="First Name"
            value={form.firstName}
          />
          <Field
            label="Last Name"
            error={formErrors.lastName}
            onChangeText={(value) => onUpdateForm("lastName", value)}
            placeholder="Last Name"
            value={form.lastName}
          />
          <Field
            keyboardType={deliveryMode === "email" ? "email-address" : "phone-pad"}
            label={recipientLabel}
            error={formErrors.destination}
            onChangeText={(value) => onUpdateForm("destination", value)}
            placeholder={recipientPlaceholder}
            value={form.destination}
          />

          <Pressable
            accessibilityRole="button"
            onPress={onToggleDeliveryMode}
            className="mb-2 self-start"
          >
            <Text className="text-[10px] font-bold text-[#026CDF] underline">
              {deliveryMode === "email"
                ? "Use Mobile Number instead"
                : "Use Email instead"}
            </Text>
          </Pressable>

          <View className="gap-[2px]">
            <Text className="text-[10.5px] font-bold leading-[12px] text-[#111111]">
              Note
            </Text>
            <TextInput
              multiline
              numberOfLines={5}
              onChangeText={(value) => onUpdateForm("note", value)}
              style={{ minHeight: 110, textAlignVertical: "top" }}
              className="border border-[#E0E0E0] bg-white px-[10px] py-2 text-[13px] font-medium text-[#111111]"
              value={form.note}
            />
          </View>
        </View>
      </View>

      <View className=" flex-row items-center justify-between bg-white px-[20px] pb-5 pt-2 ">
        <Pressable onPress={onBack} className="flex-row items-center">
          <Ionicons name="chevron-back" size={14} color="#026CDF" />
          <Text className="text-[#026CDF] text-sm tracking-tight">
            BACK
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          
          onPress={onRequestTransfer}
          className={cx(
            "h-[34px] px-10 items-center justify-center bg-black rounded-[4px]"
          )}
        >
          <Text className="text-[11px] font-black text-white">
            Transfer Tickets
          </Text>
        </Pressable>
      </View>
    </BottomDrawer>
  );
}
