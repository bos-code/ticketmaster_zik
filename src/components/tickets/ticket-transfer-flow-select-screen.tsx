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
  visible = true,
}: {
  onBack: () => void;
  onContinue: () => void;
  onToggleSeat: (seatId: string) => void;
  seatSummary: string;
  seats: Seat[];
  selectedSeatIds: string[];
  ticketCount: string;
  visible?: boolean;
}) {
  const cleanCount = ticketCount.replace(/^x/, '');
  const countText = `${cleanCount} ticket${cleanCount === '1' ? '' : 's'}`;
  
  const renderFormattedSeatSummary = (summary: string) => {
    const sectionMatch = summary.match(/(?:Sec|Section)\s+([^\s,]+)/i);
    const rowMatch = summary.match(/Row\s+([^\s,]+)/i);

    if (sectionMatch && rowMatch) {
      return (
        <Text className='text-[15.5px] font-normal leading-[20px] text-[#111111]'>
          Section <Text className="font-bold">{sectionMatch[1]}</Text>, Row <Text className="font-bold">{rowMatch[1]}</Text>
        </Text>
      );
    }
    return <Text className='text-[15.5px] font-semibold leading-[20px] text-[#111111]'>{summary}</Text>;
  };

  return (
    <BottomDrawer minHeight='62%' onClose={onBack} visible={visible}>
      <View className='py-[10px]'>
        <Text className='text-center text-[10.5px] font-bold tracking-[0.6px] leading-[14px] text-[#111111] uppercase'>
          SELECT TICKETS TO TRANSFER
        </Text>
      </View>

      <View className='px-[22px] pb-[20px] pt-[15px]'>
        <View className='flex-row items-center justify-between'>
          {renderFormattedSeatSummary(seatSummary)}
          <View className='flex-row items-center gap-[6px]'>
            <Ionicons name='receipt-outline' size={18} color='#70757E' />
            <Text className='text-[13.5px] font-normal leading-[17px] text-[#70757E]'>
              {countText}
            </Text>
          </View>
        </View>

        <View className='mt-[18px] flex-row gap-[12px]'>
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
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                      opacity: pressed ? 0.85 : 1,
                    }
                  ]}
                  className="h-[82px] w-[76px] overflow-hidden rounded-[10px] border border-[#D7DCE4] bg-white shadow-[0_1.5px_3px_rgba(0,0,0,0.08)]"
                >
                  <View className="items-center justify-center bg-[#1977F3] py-[7.5px]">
                    <Text className="text-[9.5px] font-bold tracking-[0.5px] uppercase text-white">
                      {`SEAT ${seat.seat}`}
                    </Text>
                  </View>
                  <View className='flex-1 items-center justify-center bg-white'>
                    {selected ? (
                      <View className='h-[20px] w-[20px] items-center justify-center rounded-full bg-[#1977F3]'>
                        <Ionicons name='checkmark' size={12} color='#FFFFFF' />
                      </View>
                    ) : (
                      <View className='h-[20px] w-[20px] rounded-full border border-[#CCCCCC] bg-white' />
                    )}
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <View className='flex-1 bg-white' />

      <View className='flex-row items-center justify-between border-t border-[#F0F0F0] bg-white px-[22px] pb-[34px] pt-[20px]'>
        <Text className='text-[13.5px] font-medium leading-[17px] text-[#5D6773]'>
          {`${selectedSeatIds.length} Selected`}
        </Text>

        <Pressable
          accessibilityRole='button'
          disabled={!selectedSeatIds.length}
          onPress={onContinue}
          className='flex-row items-center gap-[2.5px]'
        >
          <Text
            className={cx(
              'text-[13px] font-bold leading-[16px] tracking-[0.5px]',
              selectedSeatIds.length ? 'text-[#0A6AE4]' : 'text-[#A9C9E6]',
            )}
          >
            TRANSFER TO
          </Text>
          <Ionicons
            color={selectedSeatIds.length ? '#0A6AE4' : '#A9C9E6'}
            name='chevron-forward'
            size={15}
          />
        </Pressable>
      </View>
    </BottomDrawer>
  );
}
