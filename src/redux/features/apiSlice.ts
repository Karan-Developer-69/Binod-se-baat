// src/redux/features/apiSlice.ts
import { createSlice, type Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { addChat, updateLastChat } from "./chatSlice";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7860";

interface ApiState {
  loading: boolean;
  error: string | null;
}

const apiSlice = createSlice({
  name: "api",
  initialState: { loading: false, error: null } as ApiState,
  reducers: {
    setLoading(state, action: { payload: boolean }) {
      state.loading = action.payload;
    },
    setError(state, action: { payload: string | null }) {
      state.error = action.payload;
    },
  },
});

export const { setLoading, setError } = apiSlice.actions;

// MAIN THUNK — Go Fiber AI ko call karega (stream + web + deep)
export const getResponse =
  (
    prompt: string,
    apiUrl: string = API_URL,
    sessionId: string = "session-1", // abhi optional, backend ignore kare to bhi ok
    webSearch: boolean = false,
    deepThink: boolean = false,
    signal?: AbortSignal
  ) =>
  async (dispatch: Dispatch) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Assistant ke liye empty message jisme stream append hoga
    dispatch(
      addChat({
        id: Date.now(),
        role: "assistant",
        content: "",
      })
    );

    try {
      let lastLength = 0;

      await axios.post(
        `${apiUrl}/generate`,
        {
          query: prompt,
          web_search: webSearch,
          deep_think: deepThink,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          signal,
          // Axios v1 browser streaming hack
          onDownloadProgress: (progressEvent) => {
            const xhr = (progressEvent as any).event?.currentTarget
              || (progressEvent as any).event?.target;
            if (!xhr) return;

            const responseText: string = xhr.responseText || xhr.response || "";
            const chunk = responseText.substring(lastLength);
            lastLength = responseText.length;

            if (chunk) {
              dispatch(updateLastChat(chunk));
            }
          },
        }
      );
    } catch (err: any) {
      if (axios.isCancel(err)) {
        console.log("Request canceled by user");
      } else {
        console.error("API Error:", err);
        dispatch(setError(err.message || "Failed to fetch response"));
        dispatch(
          updateLastChat(
            "\n\n❌ **Connection Error:** Backend is not running or failed to respond."
          )
        );
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

export default apiSlice.reducer;
        }
    } finally {
        dispatch(setLoading(false));
    }
};

export default apiSlice.reducer;
