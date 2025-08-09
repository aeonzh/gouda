import { Redirect } from 'expo-router';

export default function OrderHistoryScreen() {
  // Redirect this legacy route to the tabbed Orders screen
  return <Redirect href='/(tabs)/orders' />;
}
