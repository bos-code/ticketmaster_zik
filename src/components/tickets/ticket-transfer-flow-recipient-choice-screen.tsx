import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import {
  BackLink,
  TransferScaffold,
} from "@/components/tickets/ticket-transfer-flow-transfer-ui";

export function TicketTransferRecipientChoiceScreen({
  onBack,
  onManualEntry,
  onOpenViewer,
  onSelectContact,
}: {
  onBack: () => void;
  onManualEntry: () => void;
  onOpenViewer: () => void;
  onSelectContact: () => void;
}) {
  return (
    <TransferScaffold onBack={onBack} onPrimaryPress={onOpenViewer}>
      <View className="flex-1 items-center px-[18px] pt-[30px]">
        <Text className="mb-7 text-[12px] font-medium leading-[15px] text-[#70757E]">
          TRANSFER TO
        </Text>

        <RecipientChoiceButton
          iconName="person-add-outline"
          label="Select From Contacts"
          onPress={onSelectContact}
        />

        <RecipientChoiceButton
          iconName="add-circle-outline"
          label="Manually Enter A Recipient"
          onPress={onManualEntry}
        />

        <View className="mt-[78px] items-center justify-center">
          <Ionicons color="#0D0D0D" name="paper-plane-outline" size={54} />
        </View>

        <Text className="mt-4 text-center text-[15px] font-bold leading-5 text-[#242424]">
          Transfer Ticket Via Email or Text Message
        </Text>
        <Text className="mt-4 max-w-[272px] text-center text-[13px] font-normal leading-[18px] text-[#4F5966]">
          Select an email or mobile number to transfer tickets to your
          recipient.
        </Text>
      </View>

      <View className="px-[14px] pb-[30px]">
        <BackLink onPress={onBack} />
      </View>
    </TransferScaffold>
  );
}

function RecipientChoiceButton({
  iconName,
  label,
  onPress,
}: {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="mb-[10px] h-[38px] w-full flex-row items-center justify-center gap-2 border border-[#86B7D5]"
    >
      <Text className="text-[12px] font-medium leading-[14px] text-[#327CAA]">
        {label}
      </Text>
      <Ionicons color="#2A84C6" name={iconName} size={17} />
    </Pressable>
  );
}
