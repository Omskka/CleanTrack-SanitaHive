import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

export default function createAccount() {
    const { team } = useLocalSearchParams();
    
    return (
        <Text>CREATE ACCOUNT FOR TEAM: {team}</Text>
    );
}