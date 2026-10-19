import { Text } from '@/components/ui/app-text';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import type { Seat } from '@/components/tickets/ticketFlowTypes';
import { BottomDrawer } from '@/components/ui/bottom-drawer';
import { useDrawerTheme } from '@/components/ui/drawer-theme';

export function TicketTransferSelectScreen({
  onBack,
  onContinue,
  onToggleSeat,
  seatSummary,
  seats,
  selectedSeatIds,
  ticketCount,
}: {
  onBack: () => void;
  onContinue: () => void;
  onToggleSeat: (seatId: string) => void;
  seatSummary: string;
  seats: Seat[];
  selectedSeatIds: string[];
  ticketCount: string;
}) {
  const { colors } = useDrawerTheme();
  const canContinue = selectedSeatIds.length > 0;

  return (
    <BottomDrawer minHeight='62%' onClose={onBack} visible={true}>
      <View className='border-b py-4' style={{ borderColor: colors.divider }}>
        <Text className='text-center text-[12px] font-medium leading-[15px]' style={{ color: colors.textMuted }}>
          SELECT TICKETS TRANSFER TICKET
        </Text>
      </View>

      <View className='border-b px-[16px] pb-[16px] pt-[24px]' style={{ borderColor: colors.divider }}>
        <View className='flex-row items-center justify-between'>
          <Text className='text-[13px] font-medium leading-[15px]' style={{ color: colors.textSecondary }}>
            {seatSummary}
          </Text>
          <Text className='text-[12px] font-normal leading-[15px]' style={{ color: colors.textMuted }}>
            {ticketCount.replace(/^x/, '')}
          </Text>
        </View>

        <View className='mt-5 flex-row flex-wrap gap-[14px]'>
          {seats.map((seat) => {
            const selected = selectedSeatIds.includes(seat.id);

            return (
              <Animated.View
                key={seat.id}
                layout={LinearTransition.springify().damping(18).stiffness(160)}
              >
                <Pressable
                  accessibilityRole='button'
                  onPress={() => onToggleSeat(seat.id)}
                  className='min-h-[88px] w-[80px] overflow-hidden rounded-[8px] border shadow-[0_1px_1.5px] shadow-black/60'
                  style={{ backgroundColor: colors.sheetRaised, borderColor: colors.seatBorder }}
                >
                  <View className='py-2 items-center justify-center bg-[#1977F3]'>
                    <Text className='text-[11px] font-semibold leading-[14px] text-white'>
                      {`SEAT ${seat.seat}`}
                    </Text>
                  </View>
                  <View className='flex-1 items-center justify-center' style={{ backgroundColor: colors.seatBody }}>
                    {selected ? (
                      <View className='h-[24px] w-[24px] items-center justify-center rounded-full bg-[#1977F3]'>
                        <Ionicons name='checkmark' size={15} color='#FFFFFF' />
                      </View>
                    ) : (
                      <View className='size-6 rounded-full border' style={{ backgroundColor: colors.sheetRaised, borderColor: colors.checkBorder }} />
                    )}
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <View className='flex-1' style={{ backgroundColor: colors.sheet }} />

      <View className='flex-row items-center justify-between px-[16px] pb-[40px] pt-[20px]' style={{ backgroundColor: colors.sheetFooter }}>
        <Text className='text-[12px] font-normal leading-[14px]' style={{ color: colors.textHint }}>
          {`${selectedSeatIds.length} Selected`}
        </Text>

        <Pressable
          accessibilityRole='button'
          disabled={!canContinue}
          onPress={onContinue}
          className='min-h-[44px] flex-row items-center gap-[2px]'
        >
          <Text
            className='text-[14px] font-bold leading-[18px]'
            style={{ color: canContinue ? colors.link : colors.linkDisabled }}
          >
            TRANSFER TO
          </Text>
          <Ionicons
            color={canContinue ? colors.link : colors.linkDisabled}
            name='chevron-forward'
            size={17}
          />
        </Pressable>
      </View>
    </BottomDrawer>
  );
}
