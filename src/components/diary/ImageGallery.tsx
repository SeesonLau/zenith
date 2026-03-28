// src/components/diary/ImageGallery.tsx (FINAL FIX - NO aspect property at all)
import React from 'react';
import { View, Text, Image, Pressable, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  compressImage,
  canAddImage,
  formatFileSize,
  type ImageInfo,
} from '@/src/utils/imageHelpers';

interface ImageGalleryProps {
  images: ImageInfo[];
  onAddImage?: (imageInfo: ImageInfo) => void;
  onRemoveImage?: (index: number) => void;
  editable?: boolean;
  maxImages?: number;
  maxTotalSize?: number;
}

export default function ImageGallery({
  images,
  onAddImage,
  onRemoveImage,
  editable = false,
  maxImages = 6,
  maxTotalSize = 5 * 1024 * 1024, // 5MB
}: ImageGalleryProps) {
  const [isCompressing, setIsCompressing] = React.useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to add images.');
      return;
    }

    // FINAL FIX: Completely removed aspect property to avoid NativeWind parser
    // Images will crop to whatever aspect ratio is needed
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: [1, 1], // REMOVED - causes NativeWind parser error
      quality: 0.8,
    });

    if (!result.canceled && onAddImage) {
      setIsCompressing(true);

      try {
        // Compress image
        const compressedImage = await compressImage(result.assets[0].uri);

        // Check limits
        const check = canAddImage(images, compressedImage.fileSize, maxImages, maxTotalSize);

        if (!check.canAdd) {
          Alert.alert('Cannot Add Image', check.reason);
          setIsCompressing(false);
          return;
        }

        onAddImage(compressedImage);
      } catch (error) {
        Alert.alert('Error', 'Failed to process image');
        console.error('Image processing error:', error);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const totalSize = images.reduce((sum, img) => sum + img.fileSize, 0);

  if (images.length === 0 && !editable) {
    return null;
  }

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white font-semibold">
          Photos {images.length > 0 && `(${images.length}/${maxImages})`}
        </Text>
        {images.length > 0 && (
          <Text className="text-slate-400 text-xs">
            {formatFileSize(totalSize)} / 5MB
          </Text>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {images.map((imageInfo, index) => (
            <View key={index} className="relative">
              {/* IMPROVED: Square images with consistent size */}
              <Image
                source={{ uri: imageInfo.uri }}
                className="w-28 h-28 rounded-xl"
                resizeMode="cover"
              />
              {editable && onRemoveImage && (
                <Pressable
                  onPress={() => onRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 rounded-full w-6 h-6 items-center justify-center shadow-lg"
                >
                  <Ionicons name="close" size={16} color="white" />
                </Pressable>
              )}
              {/* File size indicator */}
              <View className="absolute bottom-1 left-1 bg-black/60 rounded px-2 py-0.5">
                <Text className="text-white text-[10px]">
                  {formatFileSize(imageInfo.fileSize)}
                </Text>
              </View>
            </View>
          ))}

          {editable && onAddImage && images.length < maxImages && (
            <Pressable
              onPress={pickImage}
              disabled={isCompressing}
              className="w-28 h-28 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl items-center justify-center"
            >
              {isCompressing ? (
                <>
                  <Ionicons name="hourglass" size={24} color="#64748b" />
                  <Text className="text-slate-500 text-xs mt-2">Processing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="add" size={32} color="#64748b" />
                  <Text className="text-slate-500 text-xs mt-2">Add Photo</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Progress bar for total size */}
      {editable && images.length > 0 && (
        <View className="mt-3">
          <View className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <View
              className="h-full bg-sky-500"
              style={{ width: `${(totalSize / maxTotalSize) * 100}%` }}
            />
          </View>
        </View>
      )}
    </View>
  );
}