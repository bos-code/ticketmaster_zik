import { Text, TextInput } from '@/components/ui/app-text';
import React from "react";
import { Pressable, View } from "react-native";

import { cx } from "@/components/tickets/cx";
import { Field } from "@/components/tickets/Field";
import type { DeliveryMode, RecipientFormState } from "@/components/tickets/ticketFlowTypes";
import { BottomDrawer } from "@/components/ui/bottom-drawer";
import { useDrawerTheme } from "@/components/ui/drawer-theme";

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
  const { colors } = useDrawerTheme();
  const recipientLabel = deliveryMode === "email" ? "Email" : "Mobile Number";
  const recipientPlaceholder =
    deliveryMode === "email" ? "Enter Email Address" : "Enter Mobile Number";

  return (
    <BottomDrawer minHeight="62%" onClose={onBack} visible={true}>
      <View className="grow shrink-0 px-[20px] pt-4">
        <Text className="mb-4 text-left text-base tracking-[0.6px] font-black uppercase" style={{ color: colors.textStrong }}>
          RECIPIENT DETAILS
        </Text>

        <View
          className="w-full"
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
            className="mb-2 min-h-[44px] justify-center self-start"
          >
            <Text className="text-[14px] font-bold underline" style={{ color: colors.action }}>
              {deliveryMode === "email"
                ? "Use Mobile Number instead"
                : "Use Email instead"}
            </Text>
          </Pressable>

          <View className="gap-[2px]">
            <Text className="text-[14px] font-bold leading-[20px]" style={{ color: colors.text }}>
              Note
            </Text>
            <TextInput
              multiline
              numberOfLines={5}
              onChangeText={(value) => onUpdateForm("note", value)}
              style={{ minHeight: 110, textAlignVertical: "top", backgroundColor: colors.sheetRaised, borderColor: colors.inputBorderSoft, color: colors.text }}
              className="border px-[10px] py-2 text-[16px] font-medium"
              value={form.note}
            />
          </View>
        </View>
      </View>

      <View className=" flex-row items-center justify-between px-[20px] pb-5 pt-2 " style={{ backgroundColor: colors.sheet }}>
        <Pressable onPress={onBack} accessibilityRole="button" className="min-h-[44px] flex-row items-center">
          <Ionicons name="chevron-back" size={14} color={colors.action} />
          <Text className="text-sm tracking-tight" style={{ color: colors.action }}>
            BACK
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          
          disabled={!transferReady}
          accessibilityState={{ disabled: !transferReady }}
          style={{ opacity: transferReady ? 1 : 0.5, backgroundColor: colors.button }}
          onPress={onRequestTransfer}
          className={cx(
            "min-h-[48px] px-5 items-center justify-center rounded-[4px]"
          )}
        >
          <Text className="text-[14px] font-black" style={{ color: colors.onButton }}>
            Transfer Tickets
          </Text>
        </Pressable>
      </View>
    </BottomDrawer>
  );
}
