import React, { useId } from 'react';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

const stripeHeight = 24 / 13;
const star = 'M0-.6.14-.19.57-.19.23.07.35.48 0 .23-.35.48-.23.07-.57-.19-.14-.19Z';

// Local vector artwork keeps the circular flag identical on native and web.
export function USCountryIcon({ size = 26 }: { size?: number }) {
  const clipId = `us-country-${useId().replace(/:/g, '')}`;

  return <Svg width={size} height={size} viewBox="0 0 32 32" accessible={false}>
    <Defs><ClipPath id={clipId}><Circle cx={16} cy={16} r={12} /></ClipPath></Defs>
    <Circle cx={16} cy={16} r={15} fill="#111111" stroke="#707070" strokeWidth={1.5} />
    <G clipPath={`url(#${clipId})`}>
      <Rect x={4} y={4} width={24} height={24} fill="#F4F4F4" />
      {Array.from({ length: 7 }, (_, index) => <Rect key={index} x={4} y={4 + index * stripeHeight * 2} width={24} height={stripeHeight} fill="#C65B69" />)}
      <Rect x={4} y={4} width={12} height={stripeHeight * 7} fill="#45658E" />
      {Array.from({ length: 9 }, (_, row) => Array.from({ length: row % 2 === 0 ? 6 : 5 }, (_, column) =>
        <Path key={`${row}-${column}`} d={star} fill="#F4F4F4" transform={`translate(${5 + column * 2 + (row % 2)} ${4.8 + row * 1.4})`} />
      ))}
    </G>
  </Svg>;
}
