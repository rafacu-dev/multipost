import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useStore } from '../store';

interface Props {
    id: string;
}

export function Checkbox(props:Props) {
    const { groups, setGroups } = useStore()

    const group = groups.find(group => group.url === props.id);
    const index = groups.findIndex(group => group.url === props.id);


    const handlerSetGroups = () => {
        let newGroups = groups
        if (index !== -1) {
            groups[index] = { ...group, select:!group.select };
        }
        setGroups(newGroups)
    }


    return (
        <Pressable
        style={[styles.checkboxBase,]}
        onPress={handlerSetGroups}>
        {group.select && <View style={styles.checkboxChecked} />}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    checkboxBase: {
      width: 24,
      height: 24,
      padding: 4,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 24,
      borderWidth: 2,
      borderColor: '#1877F2',
      backgroundColor: 'transparent',
    },
    checkboxChecked: {
        width: 16,
        height: 16,
        borderRadius: 21,
        backgroundColor: '#1877F2',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkboxLabel: {
      marginLeft: 8,
      fontWeight: '500',
      fontSize: 18,
    },
  });