import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface HistoryItem {
    id: string;
    title: string;
    date: string;
}

const historySlice = createSlice({
    name: 'history',
    initialState: [] as HistoryItem[],
    reducers: {
        loadOldData(_state, action: PayloadAction<HistoryItem[]>) {
            return action.payload;
        },
        addToHistory(state, action: PayloadAction<HistoryItem>) {
            // Unshift equivalent to add to beginning
            const exists = state.find(item => item.id === action.payload.id);
            if (exists) {
                exists.title = action.payload.title;
                exists.date = action.payload.date;
            } else {
                state.unshift(action.payload);
            }
        },
        deleteFromHistory(state, action: PayloadAction<string>) {
            return state.filter(item => item.id !== action.payload);
        },
        clearHistory() {
            return [];
        }
    }
});

export const { addToHistory, clearHistory, deleteFromHistory, loadOldData } = historySlice.actions;

export default historySlice.reducer;