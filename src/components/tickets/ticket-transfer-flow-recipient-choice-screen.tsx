import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { BackLink } from "@/components/tickets/BackLink";
import { BottomDrawer } from "@/components/ui/bottom-drawer";

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
    <BottomDrawer minHeight="75%" onClose={onBack} visible={true}>
      <View className="flex-1 items-center px-[24px] pt-4">
        <Text className="mb-6 text-center text-sm font-semibold tracking-[0.5px] text-[#4F5966]">
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

        <View className="mt-[60px] items-center justify-center">
          <Image
            source={require("../../../assets/tabicon/send.png")}
            style={{ width: 110, height: 110 }}
            contentFit="contain"
          />
        </View>

        <Text className="mt-6 text-center text-[16px] font-bold leading-6 text-[#111111]">
          Transfer Ticket Via Email or Text
          {"\n"}Message
        </Text>
        <Text className="mt-3 max-w-[230px] text-center text-[13px] font-normal leading-[19px] text-[#4F5966]">
          Select an Email or mobile number to transfer tickets to your recipient
        </Text>
      </View>

      <View className="px-[16px] pb-[24px]">
        <BackLink onPress={onBack} />
      </View>
    </BottomDrawer>
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
      className="mb-[12px] h-[48px] w-full flex-row items-center justify-center gap-3 border border-[#86B7D5] bg-white active:bg-gray-50"
    >
      <Text className="text-[13px] font-semibold leading-[16px] text-[#026CDF]">
        {label}
      </Text>
      <Ionicons color="#026CDF" name={iconName} size={20} />
    </Pressable>
  );
}
