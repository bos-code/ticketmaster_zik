import React from 'react';
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useEditable } from '@/components/tickets/EditableContext';
import type { TicketRecord } from '@/store/ticketStore';

type EditableTextProps = {
  /** Which TicketRecord field this maps to. Only used when editable. */
  field?: keyof TicketRecord;
  /** The current display value. */
  value: string;
  /** Pass-through style for the Text / TextInput. */
  style?: StyleProp<TextStyle>;
  /** NativeWind className — passed to both Text and TextInput. */
  className?: string;
  /** Maximum lines shown. */
  numberOfLines?: number;
  /** If true, allow multiline editing. */
  multiline?: boolean;
};

/**
 * Renders a plain <Text> in user mode.
 * In admin preview mode (EditableContext present), renders an inline
 * TextInput styled identically, with a subtle focus indicator.
 */
export function EditableText({
  field,
  value,
  style,
  className,
  numberOfLines,
  multiline,
}: EditableTextProps) {
  const ctx = useEditable();
  const editable = ctx?.editable && field;

  if (!editable) {
    return (
      <Text style={style} className={className} numberOfLines={numberOfLines}>
        {value}
      </Text>
    );
  }

  return (
    <View style={editWrapStyle}>
      <TextInput
        value={value}
        onChangeText={(v) => ctx.onFieldChange(field, v)}
        style={[style as TextStyle, inputResetStyle]}
        className={className}
        numberOfLines={numberOfLines}
        multiline={multiline || (numberOfLines ? numberOfLines > 1 : false)}
        scrollEnabled={false}
        textAlignVertical="top"
        underlineColorAndroid="transparent"
      />
      <View style={editIndicatorStyle} />
    </View>
  );
}

const editWrapStyle: ViewStyle = {
  position: 'relative',
};

const inputResetStyle: TextStyle = {
  padding: 0,
  margin: 0,
  borderWidth: 0,
};

const editIndicatorStyle: ViewStyle = {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: -1,
  height: 1,
  backgroundColor: 'rgba(11, 85, 245, 0.35)',
};
