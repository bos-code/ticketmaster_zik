import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { cx } from "@/components/tickets/cx";
import { Field } from "@/components/tickets/Field";
import type { DeliveryMode, RecipientFormState } from "@/components/tickets/ticketFlowTypes";
import { BottomDrawer } from "@/components/ui/bottom-drawer";

import { Ionicons } from "@expo/vector-icons";

const RECIPIENT_INPUT_FONT_SIZE = Platform.OS === "web" ? 16 : 13;

export function TicketTransferRecipientFormScreen({
  deliveryMode,
  form,
  formErrors = {},
  onBack,
  onRequestTransfer,
  onToggleDeliveryMode,
  onUpdateForm,
  transferReady,
  visible = true,
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
  visible?: boolean;
}) {
  const recipientLabel = deliveryMode === "email" ? "Email" : "Mobile Number";
  const recipientPlaceholder =
    deliveryMode === "email" ? "Enter Email Address" : "Enter Mobile Number";

  return (
    <BottomDrawer minHeight="62%" onClose={onBack} visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardWrap}
      >
        <ScrollView
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.formScroll}
        >
          <Text className="mb-4 text-left text-base tracking-[0.6px] font-black text-black uppercase">
            RECIPIENT DETAILS
          </Text>

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
              style={styles.noteInput}
              className="border border-[#E0E0E0] bg-white px-[10px] py-2 font-medium text-[#111111]"
              value={form.note}
            />
          </View>
        </ScrollView>

        <View className=" flex-row items-center justify-between bg-white px-[20px] pb-5 pt-2 ">
          <Pressable onPress={onBack} className="flex-row items-center">
            <Ionicons name="chevron-back" size={14} color="#026CDF" />
            <Text className="text-[#026CDF] text-sm tracking-tight">
              BACK
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={!transferReady}
            onPress={onRequestTransfer}
            className={cx(
              "h-[34px] px-10 items-center justify-center rounded-[4px]",
              transferReady ? "bg-black" : "bg-[#C8CCD2]",
            )}
          >
            <Text className="text-[11px] font-black text-white">
              Transfer Tickets
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </BottomDrawer>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  noteInput: {
    fontSize: RECIPIENT_INPUT_FONT_SIZE,
    minHeight: 110,
    textAlignVertical: "top",
  },
});
