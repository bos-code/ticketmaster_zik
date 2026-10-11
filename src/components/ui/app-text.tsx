import React, { createContext, useContext } from 'react';
import { styled } from 'nativewind';
import {
  Platform,
  StyleSheet,
  Text as NativeText,
  TextInput as NativeTextInput,
  type TextProps,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import { fonts } from '../../../theme/fonts';

const TextFontContext = createContext<TextStyle>({});

const familyWeights: Record<string, number> = {
  [fonts.regular]: 400,
  [fonts.semiBold]: 600,
  [fonts.bold]: 700,
  [fonts.extraBold]: 800,
  [fonts.black]: 900,
};

function resolveFont(style: TextStyle, inherited: TextStyle): TextStyle {
  const family = style.fontFamily ?? inherited.fontFamily;
  // Keep deliberate monospace text (and icon fonts) intact.
  if (family && !family.startsWith('Averta') && family !== 'System') {
    return {};
  }

  const requestedWeight = style.fontWeight ??
    (style.fontFamily ? familyWeights[style.fontFamily] : undefined) ??
    inherited.fontWeight ?? (family ? familyWeights[family] : undefined) ?? 400;
  const weight = requestedWeight === 'bold' ? 700 :
    requestedWeight === 'normal' ? 400 : Number(requestedWeight);

  if (Platform.OS === 'web') {
    return {
      fontFamily: 'Averta',
      // Let CSS utility classes supply the weight when no inline weight exists.
      ...(style.fontFamily && !style.fontWeight && familyWeights[style.fontFamily]
        ? { fontWeight: familyWeights[style.fontFamily] as TextStyle['fontWeight'] }
        : {}),
    };
  }

  return {
    fontFamily: weight >= 900 ? fonts.black : weight >= 800 ? fonts.extraBold :
      weight >= 700 ? fonts.bold : weight >= 600 ? fonts.semiBold : fonts.regular,
    // Each native family is an actual weight; avoid synthesizing bold on top.
    fontWeight: 'normal',
  };
}

function FontText({ style, ref, ...props }: TextProps & { ref?: React.Ref<NativeText> }) {
  const inherited = useContext(TextFontContext);
  const flattened = StyleSheet.flatten(style) ?? {};
  const font = resolveFont(flattened, inherited);
  return (
    <TextFontContext.Provider value={{ ...inherited, ...flattened }}>
      <NativeText {...props} ref={ref} style={[style, font]} />
    </TextFontContext.Provider>
  );
}

function FontTextInput({ style, ref, ...props }: TextInputProps & { ref?: React.Ref<NativeTextInput> }) {
  const flattened = StyleSheet.flatten(style) ?? {};
  return <NativeTextInput {...props} ref={ref} style={[style, resolveFont(flattened, {})]} />;
}

// Resolve NativeWind utilities before choosing the corresponding native font.
export const Text = styled(FontText, { className: 'style' });
export const TextInput = styled(FontTextInput, { className: 'style' });
