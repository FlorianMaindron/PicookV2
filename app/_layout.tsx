import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe" options={{ headerShown: false, animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style="dark" backgroundColor="#FFFBF5" />
    </>
  );
}
