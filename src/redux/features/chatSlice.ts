import { createSlice } from "@reduxjs/toolkit";



export interface ChatMessage {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    title?: string | null;
}

const initialState: ChatMessage[] = [];

const chatSlice = createSlice({
    name: 'chatHistory',
    initialState,
    reducers: {
        setChatData(state, action: { payload: ChatMessage[]; type: string }) {
            state = action.payload;
            return state;
        },
        addChat(state, action: { payload: ChatMessage; type: string }) {
            state.push(action.payload);
        },
        updateLastChat(state, action: { payload: string }) {
            const lastMsg = state[state.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
                lastMsg.content += action.payload;
            }
        },
        clearChat() {
            return [];
        },
    }
});

export const { addChat, clearChat, updateLastChat, setChatData } = chatSlice.actions;
export default chatSlice.reducer;