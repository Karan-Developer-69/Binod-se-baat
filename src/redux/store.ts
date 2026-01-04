import { configureStore } from '@reduxjs/toolkit'
import userReducer from "./features/userSlice";
import chatReducer from "./features/chatSlice";
import apiReducer from "./features/apiSlice";
import historyReducer from "./features/historySlice";

export const store = configureStore({
    reducer:{
        user:userReducer,
        chatHistory:chatReducer,
        api:apiReducer,
        history:historyReducer
    }
})