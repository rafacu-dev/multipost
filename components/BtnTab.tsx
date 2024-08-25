
import { Pressable, StyleSheet, Text } from 'react-native';


interface Props {
    onPress: () => void;
    isSelected: boolean;
    text: string;
}

export function BtnTab(props:Props) {
    return (
        <Pressable
        style={[styles.base, props.isSelected && styles.baseSelected]}
        onPress={props.onPress}>
            <Text style={[styles.text, props.isSelected && styles.textSelected]}>{props.text}</Text>
        </Pressable>
  );
}

const styles = StyleSheet.create({
    text: {
        fontWeight: 600,
        color: "gray",
    },
    textSelected: {
        fontWeight: 800,
        color: "#1877F2",

    },

    base: {
        flex: 1,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    baseSelected: {
        borderRadius: 6,
        backgroundColor: '#dbeafe',
        borderBottomColor: '#1877F2',
        borderBottomWidth: 1
    },
  });