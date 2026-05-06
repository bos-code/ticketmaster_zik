import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image as RNImage,
  Platform,
  Pressable,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useEditable } from '@/components/tickets/EditableContext';
import type { TicketRecord } from '@/store/ticketStore';

type EditableImageProps = {
  /** Which TicketRecord field this maps to. */
  field?: keyof TicketRecord;
  /** Current image URI. */
  uri: string;
  /** Image style. */
  style?: StyleProp<ImageStyle>;
  /** NativeWind className. */
  className?: string;
  /** Use expo-image (default) or RN Image. */
  useExpoImage?: boolean;
  /** contentFit for expo-image. */
  contentFit?: 'cover' | 'contain' | 'fill';
  /** resizeMode for RN Image. */
  resizeMode?: 'cover' | 'contain' | 'stretch';
  /** blur radius for RN Image. */
  blurRadius?: number;
};

export function EditableImage({
  field,
  uri,
  style,
  className,
  useExpoImage = true,
  contentFit = 'cover',
  resizeMode = 'cover',
  blurRadius,
}: EditableImageProps) {
  const ctx = useEditable();
  const editable = ctx?.editable && field;
  const [isPicking, setIsPicking] = useState(false);

  const imageElement = useExpoImage ? (
    <ExpoImage
      contentFit={contentFit}
      source={{ uri }}
      style={style}
      className={className}
    />
  ) : (
    <RNImage
      source={{ uri }}
      style={style as StyleProp<ImageStyle>}
      className={className}
      resizeMode={resizeMode}
      blurRadius={blurRadius}
    />
  );

  if (!editable) {
    return imageElement;
  }

  async function handlePick() {
    if (isPicking || !ctx || !field) return;

    try {
      setIsPicking(true);

      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Photos permission needed', 'Allow photo library access to change ticket artwork.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        base64: true,
        mediaTypes: ['images'],
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const nextUri = asset.base64
        ? `data:${asset.mimeType?.startsWith('image/') ? asset.mimeType : 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;

      ctx.onFieldChange(field, nextUri);
    } catch {
      Alert.alert('Image upload unavailable', 'Could not open the photo library right now.');
    } finally {
      setIsPicking(false);
    }
  }

  return (
    <Pressable onPress={handlePick} style={pressableStyle}>
      {imageElement}
      <View style={overlayStyle}>
        <View style={iconBubbleStyle}>
          <Ionicons name="camera" size={16} color="#FFFFFF" />
        </View>
      </View>
    </Pressable>
  );
}

const pressableStyle: ViewStyle = {
  position: 'relative',
};

const overlayStyle: ViewStyle = {
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 50,
};

const iconBubbleStyle: ViewStyle = {
  alignItems: 'center',
  backgroundColor: 'rgba(11, 85, 245, 0.72)',
  borderRadius: 16,
  height: 32,
  justifyContent: 'center',
  width: 32,
};
