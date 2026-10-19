import { Text } from '@/components/ui/app-text';
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";

import { BackLink } from "@/components/tickets/BackLink";
import { BottomDrawer } from "@/components/ui/bottom-drawer";
import { useDrawerTheme } from "@/components/ui/drawer-theme";
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
  const { colors } = useDrawerTheme();

  return (
    <BottomDrawer minHeight="62%" onClose={onBack} visible={true}>
      <View className="grow shrink-0 items-center px-[24px] pt-4">
        <Text className="mb-6 text-center text-sm font-semibold tracking-[0.5px]" style={{ color: colors.textCaption }}>
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

        <Text className="mt-6 text-center text-sm font-bold leading-6" style={{ color: colors.text }}>
          Transfer Ticket Via Email or Text
          {"\n"}Message
        </Text>
        <Text className="mt-3 max-w-[230px] text-center  font-normal leading-[19px]" style={{ color: colors.textCaption }}>
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
  const { colors } = useDrawerTheme();
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      className="mb-[12px] w-[90%] min-h-[48px] py-2 flex-row items-center justify-center gap-3 border"
      style={{ backgroundColor: pressed ? colors.sheetPressed : colors.sheetRaised, borderColor: colors.actionBorder }}
    >
      <Text className="text-[15px] font-semibold leading-[22px]" style={{ color: colors.action }}>
        {label}
      </Text>
      {iconSource ? (
        <Image
          source={iconSource}
          style={{ width: 18, height: 18 }}
          contentFit="contain"
          tintColor={colors.action}
        />
      ) : (
        <Ionicons color={colors.action} name={iconName} size={20} />
      )}
    </Pressable>
  );
}
