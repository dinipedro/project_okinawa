/**
 * Okinawa Design System - Avatar Component
 * 
 * A customizable avatar component for user profiles
 * with support for images, initials, and status indicators.
 */

import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOkinawaTheme } from '../contexts/ThemeContext';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type StatusType = 'online' | 'offline' | 'away' | 'busy';

interface AvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: AvatarSize;
  status?: StatusType;
  showBorder?: boolean;
  style?: ViewStyle;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  status,
  showBorder = false,
  style,
}) => {
  const { theme } = useOkinawaTheme();

  const getSizeValue = (): number => {
    switch (size) {
      case 'xs':
        return 24;
      case 'sm':
        return theme.layout.avatarSmall;
      case 'md':
        return theme.layout.avatarMedium;
      case 'lg':
        return theme.layout.avatarLarge;
      case 'xl':
        return theme.layout.avatarXLarge;
      default:
        return theme.layout.avatarMedium;
    }
  };

  const getInitials = (fullName?: string): string => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getStatusColor = (statusType: StatusType): string => {
    switch (statusType) {
      case 'online':
        return theme.colors.success;
      case 'offline':
        return theme.colors.foregroundMuted;
      case 'away':
        return theme.colors.warning;
      case 'busy':
        return theme.colors.error;
      default:
        return theme.colors.foregroundMuted;
    }
  };

  const sizeValue = getSizeValue();
  const fontSize = sizeValue * 0.4;
  const statusSize = sizeValue * 0.25;
  const borderWidth = showBorder ? 2 : 0;

  const containerStyle: ViewStyle = {
    width: sizeValue,
    height: sizeValue,
    borderRadius: sizeValue / 2,
    overflow: 'hidden',
    ...(showBorder && {
      borderWidth,
      borderColor: theme.colors.card,
    }),
    ...theme.componentShadows.avatar,
    ...style,
  };

  return (
    <View style={containerStyle}>
      {source ? (
        <Image
          source={source}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.placeholder}
        >
          <Text style={[styles.initials, { fontSize }]}>
            {getInitials(name)}
          </Text>
        </LinearGradient>
      )}

      {status && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: getStatusColor(status),
              borderColor: theme.colors.card,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </View>
  );
};

// Avatar Group Component
interface AvatarGroupProps {
  avatars: Array<{ source?: { uri: string }; name?: string }>;
  max?: number;
  size?: AvatarSize;
  style?: ViewStyle;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'sm',
  style,
}) => {
  const { theme } = useOkinawaTheme();
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const getSizeValue = (): number => {
    switch (size) {
      case 'xs':
        return 24;
      case 'sm':
        return theme.layout.avatarSmall;
      case 'md':
        return theme.layout.avatarMedium;
      case 'lg':
        return theme.layout.avatarLarge;
      case 'xl':
        return theme.layout.avatarXLarge;
      default:
        return theme.layout.avatarSmall;
    }
  };

  const sizeValue = getSizeValue();
  const overlap = sizeValue * 0.3;

  return (
    <View style={[styles.avatarGroup, style]}>
      {displayAvatars.map((avatar, index) => (
        <View
          key={index}
          style={{
            marginLeft: index > 0 ? -overlap : 0,
            zIndex: displayAvatars.length - index,
          }}
        >
          <Avatar
            source={avatar.source}
            name={avatar.name}
            size={size}
            showBorder
          />
        </View>
      ))}

      {remaining > 0 && (
        <View
          style={[
            styles.remainingBadge,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
              marginLeft: -overlap,
              backgroundColor: theme.colors.backgroundTertiary,
              borderWidth: 2,
              borderColor: theme.colors.card,
            },
          ]}
        >
          <Text
            style={[
              styles.remainingText,
              {
                fontSize: sizeValue * 0.35,
                color: theme.colors.foregroundSecondary,
              },
            ]}
          >
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    borderWidth: 2,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingText: {
    fontWeight: '600',
  },
});

export default Avatar;
