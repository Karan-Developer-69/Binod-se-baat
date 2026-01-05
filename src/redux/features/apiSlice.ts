// Updated apiSlice.ts - Now works with your Go Fiber AI Agent (port 7860)
import { createSlice, type Dispatch } from "@reduxjs/toolkit";
import { addChat, updateLastChat } from "./chatSlice";

// Updated for your Go Fiber API (change port if deployed)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7860";

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

// Updated: Matches your Go backend exactly (query, web_search, deep_think)
export const getResponse = (
    prompt: string, 
    apiUrl: string = API_URL, 
    sessionId: string = "session-1", 
    webSearch: boolean = false,
    deepThink: boolean = false,
    signal?: AbortSignal
) => async (dispatch: Dispatch) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Add initial empty assistant message
    dispatch(addChat({
        id: Date.now(),
        role: 'assistant',
        content: webSearch ? "🔍 Searching Web...\n" : (deepThink ? "🧠 DeepThink Analyzing...\n" : '')
    }));

    try {
        let lastLength = 0;

        // Exact payload your Go backend expects
        await axios.post(`${apiUrl}/generate`, {
            query: prompt,
            web_search: webSearch,    // Changed from thread_id
            deep_think: deepThink     // New options for web/deep
        }, {
            headers: {
                "Content-Type": "application/json",
            },
            signal,
            responseType: 'stream',  // Better for true streaming
            onDownloadProgress: (progressEvent) => {
                if (progressEvent.progress) {
                    const response = progressEvent.currentTarget.response;
                    const chunk = response.substring(lastLength);
                    lastLength = response.length;

                    if (chunk) {
                        dispatch(updateLastChat(chunk));
                    }
                }
            }
        });

    } catch (err: any) {
        if (axios.isCancel(err)) {
            console.log("Request canceled");
        } else {
            console.error("API Error:", err);
            dispatch(setError(err.response?.data || err.message || "AI Agent not running"));
            dispatch(updateLastChat("\n\n❌ **Error:** Make sure Docker is running on port 7860"));
        }
    } finally {
        dispatch(setLoading(false));
    }
};

export default apiSlice.reducer;
