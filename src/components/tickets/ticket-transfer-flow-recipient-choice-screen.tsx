import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { BackLink } from "@/components/tickets/BackLink";
import { BottomDrawer } from "@/components/ui/bottom-drawer";
import { ticketTransferChoiceIconSources } from "../../../asset-sources";

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
    <BottomDrawer minHeight="62%" onClose={onBack} visible={true}>
      <View className="flex-1 items-center px-[24px] pt-4">
        <Text className="mb-6 text-center text-sm font-semibold tracking-[0.5px] text-[#4F5966]">
          TRANSFER TO
        </Text>

        <RecipientChoiceButton
          iconSource={ticketTransferChoiceIconSources.contactsBook}
          label="Select From Contacts"
          onPress={onSelectContact}
        />

        <RecipientChoiceButton
          iconName="add-circle-outline"
          label="Manually Enter A Recipient"
          onPress={onManualEntry}
        />

        <View className="mt-12 items-center justify-center">
          <Image
            source={ticketTransferChoiceIconSources.send}
            style={{ width: 90, height: 90 }}
            contentFit="contain"
          />
        </View>

        <Text className="mt-6 text-center text-sm font-bold leading-6 text-[#111111]">
          Transfer Ticket Via Email or Text
          {"\n"}Message
        </Text>
        <Text className="mt-3 max-w-[230px] text-center  font-normal leading-[19px] text-[#4F5966]">
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
  iconSource,
  label,
  onPress,
}: {
  iconName?: React.ComponentProps<typeof Ionicons>["name"];
  iconSource?: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="mb-[12px] w-[90%] py-2 flex-row items-center justify-center gap-3 border border-[#86B7D5] bg-white active:bg-gray-50"
    >
      <Text className="text-[13px] font-semibold leading-[16px] text-[#026CDF]">
        {label}
      </Text>
      {iconSource ? (
        <Image
          source={iconSource}
          style={{ width: 18, height: 18 }}
          contentFit="contain"
          tintColor="#026CDF"
        />
      ) : (
        <Ionicons color="#026CDF" name={iconName} size={20} />
      )}
    </Pressable>
  );
}
