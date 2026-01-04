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

// Optional: You can pass a sessionId if you want to maintain chat history per user
export const getResponse = (prompt: string, apiUrl: string = API_URL, sessionId: string = "session-1") => async (dispatch: Dispatch) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Add initial empty assistant message to UI
    dispatch(addChat({
        id: Date.now(),
        role: 'assistant',
        content: ''
    }));

    try {
        // Backend expects: class ChatRequest(BaseModel): query: str, thread_id: str
        const response = await fetch(`${apiUrl}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: prompt,        // "prompt" changed to "query" to match Python backend
                thread_id: sessionId  // Required by Python LangGraph for memory
            }),
        });

        if (!response.body || response.status !== 200) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;

            if (value) {
                // Decode the stream chunk (Python returns text/plain chunks)
                const chunk = decoder.decode(value, { stream: true });
                dispatch(updateLastChat(chunk));
            }
        }
    } catch (err: any) {
        console.error("API Error:", err);
        dispatch(setError(err.message || "Failed to fetch response"));
        dispatch(updateLastChat("\n\n❌ **Connection Error:** Backend is not running or failed to respond."));
    } finally {
        dispatch(setLoading(false));
    }
};

export default apiSlice.reducer;