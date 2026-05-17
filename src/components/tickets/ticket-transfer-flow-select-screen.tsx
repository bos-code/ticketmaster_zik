import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { cx } from '@/components/tickets/cx';
import type { Seat } from '@/components/tickets/ticketFlowTypes';
import { BottomDrawer } from '@/components/ui/bottom-drawer';

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
  const insets = useImmersiveSafeAreaInsets();
  return (
    <BottomDrawer minHeight='62%' onClose={onBack} visible={true}>
      <View className='border-b border-[#F0F0F0] py-4'>
        <Text className='text-center text-[12px] font-medium leading-[15px] text-[#70757E]'>
          SELECT TICKETS TRANSFER TICKET
        </Text>
      </View>

      <View className='border-b border-[#F0F0F0] px-[16px] pb-[16px] pt-[24px]'>
        <View className='flex-row items-center justify-between'>
          <Text className='text-[13px] font-medium leading-[15px] text-[#444B55]'>
            {seatSummary}
          </Text>
          <Text className='text-[12px] font-normal leading-[15px] text-[#70757E]'>
            {ticketCount.replace(/^x/, '')}
          </Text>
        </View>

        <View className='mt-5 flex-row gap-[14px]'>
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
                  className='h-[78px] w-[72px] overflow-hidden rounded-[8px] border border-[#D7DCE4] bg-white shadow-[0_1px_1.5px] shadow-black/60'
                >
                  <View className='py-2 items-center justify-center bg-[#1977F3]'>
                    <Text className='text-[11px] font-semibold leading-[14px] text-white'>
                      {`SEAT ${seat.seat}`}
                    </Text>
                  </View>
                  <View className='flex-1 items-center justify-center bg-[#fcf2fc]'>
                    {selected ? (
                      <View className='h-[24px] w-[24px] items-center justify-center rounded-full bg-[#1977F3]'>
                        <Ionicons name='checkmark' size={15} color='#FFFFFF' />
                      </View>
                    ) : (
                      <View className='size-6 rounded-full border border-[#DBE0E6] bg-white' />
                    )}
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <View className='flex-1 bg-white' />

      <View className='flex-row items-center justify-between bg-[#F9F9F9] px-[16px] pb-[40px] pt-[20px]'>
        <Text className='text-[12px] font-normal leading-[14px] text-[#5D6773]'>
          {`${selectedSeatIds.length} Selected`}
        </Text>

        <Pressable
          accessibilityRole='button'
          disabled={!selectedSeatIds.length}
          onPress={onContinue}
          className='flex-row items-center gap-[2px]'
        >
          <Text
            className={cx(
              'text-[14px] font-bold leading-[18px]',
              selectedSeatIds.length ? 'text-[#2A84C6]' : 'text-[#A9C9E6]',
            )}
          >
            TRANSFER TO
          </Text>
          <Ionicons
            color={selectedSeatIds.length ? '#2A84C6' : '#A9C9E6'}
            name='chevron-forward'
            size={17}
          />
        </Pressable>
      </View>
    </BottomDrawer>
  );
}
