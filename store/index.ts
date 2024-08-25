import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Group } from '../types';

interface State {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
}

const loadGroups = async (): Promise<Group[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem('groups');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    // handle error
    return [];
  }
};

export const useStore = create<State>()(
  devtools((set) => ({
    groups: [],
    setGroups: async (groups: Group[]) => {
      try {
        await AsyncStorage.setItem('groups', JSON.stringify(groups));
        set({ groups: groups });
      } catch (e) {
        // handle error
      }
    },
  }))
);

// Load initial state from AsyncStorage
loadGroups().then((groups) => {
  useStore.setState({ groups });
});