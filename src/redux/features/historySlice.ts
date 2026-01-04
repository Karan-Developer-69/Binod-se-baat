import { createSlice } from "@reduxjs/toolkit";


const historySlice = createSlice({
    name: 'history',
    initialState: [] as object[],
    reducers:{
        loadOldData(state,action:{payload:string[];type:string}){
            return action.payload;
        },
        addToHistory(state,action:{payload:string;type:string}){
            state.push(action.payload);
        },
        clearHistory(state){
            return [];
        }
    }
});

export const {addToHistory,clearHistory,loadOldData} = historySlice.actions;

export default historySlice.reducer;