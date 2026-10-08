import { Alert, Platform } from 'react-native';

export function errorMessage(error: unknown, fallback = 'Please try again.') {
  return error instanceof Error ? error.message : fallback;
}

export function showError(title: string, error: unknown) {
  Alert.alert(title, errorMessage(error));
}

/** Yes/no confirmation that also works on web, where Alert has no buttons. */
export function confirm(title: string, message: string, confirmLabel = 'Confirm', destructive = false): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.confirm?.(`${title}\n\n${message}`) ?? true);
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ]);
  });
}
