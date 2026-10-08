import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

const root = `${FileSystem.documentDirectory ?? ''}worky-kitchen`;

export async function pickAndStoreImage(folder: 'profiles' | 'meals') {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    mediaTypes: ['images'],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return copyImageToAppStorage(result.assets[0].uri, folder);
}

export async function copyImageToAppStorage(sourceUri: string, folder: 'profiles' | 'meals') {
  const directory = `${root}/${folder}`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

  const extension = sourceUri.split('.').pop() ?? 'jpg';
  const target = `${directory}/${folder}_${Date.now()}.${extension}`;
  await FileSystem.copyAsync({ from: sourceUri, to: target });
  return target;
}
