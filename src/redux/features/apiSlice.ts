import { createSlice, type Dispatch } from "@reduxjs/toolkit";
import { addChat, updateLastChat } from "./chatSlice";

// Make sure your VITE_API_URL is "http://localhost:8000" in .env file
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface ApiState {
    loading: boolean;
    error: string | null;
}

const apiSlice = createSlice({
    name: 'api',
    initialState: { loading: false, error: null } as ApiState,
    reducers: {
        setLoading(state, action: { payload: boolean }) {
            state.loading = action.payload;
        },
        setError(state, action: { payload: string | null }) {
            state.error = action.payload;
        },
    }
});

export const { setLoading, setError } = apiSlice.actions;

import axios from "axios";

// Optional: You can pass a sessionId if you want to maintain chat history per user
export const getResponse = (prompt: string, apiUrl: string = API_URL, sessionId: string = "session-1", signal?: AbortSignal) => async (dispatch: Dispatch) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Add initial empty assistant message to UI
    dispatch(addChat({
        id: Date.now(),
        role: 'assistant',
        content: ''
    }));

    try {
        let lastLength = 0;

        // Backend expects: class ChatRequest(BaseModel): query: str, thread_id: str
        await axios.post(`${apiUrl}/chat`, {
            query: prompt,        // "prompt" changed to "query" to match Python backend
            thread_id: sessionId  // Required by Python LangGraph for memory
        }, {
            headers: {
                "Content-Type": "application/json",
            },
            signal, // Pass the abort signal
            responseType: 'text', // Important for streaming text
            onDownloadProgress: (progressEvent) => {
                const response = progressEvent.event.target.response;
                const chunk = response.substring(lastLength);
                lastLength = response.length;

                if (chunk) {
                    dispatch(updateLastChat(chunk));
                }
            }
        });

    } catch (err: any) {
        if (axios.isCancel(err)) {
            console.log("Request canceled by user");
        } else {
            console.error("API Error:", err);
            dispatch(setError(err.message || "Failed to fetch response"));
            dispatch(updateLastChat("\n\n❌ **Connection Error:** Backend is not running or failed to respond."));
        }
    } finally {
        dispatch(setLoading(false));
    }
};

export default apiSlice.reducer;