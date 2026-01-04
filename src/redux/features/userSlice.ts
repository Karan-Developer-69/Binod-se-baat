import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name:"user",
    initialState:{name:"",email:"",password:"",theme:"",image:"",isLoggedIn:false,isLoading:true},
    reducers:{
        auth(state,action){
            console.log("Auth action payload:", action.payload);
            state.isLoading = true;
            const {name,email,password,register} = action.payload;
            if (register){
                state.name = name;
                state.email = email;
                state.password = password;
                state.isLoggedIn = true;
                localStorage.setItem('app_preferences', JSON.stringify(state));
            } else{
                const {user} = action.payload;
                if (user.email === email && user.password === password){
                    state.isLoggedIn = true;
                } else {
                    alert("Authentication Failed: Incorrect email or password.");
                    state.isLoggedIn = false;
                }
                localStorage.setItem('app_preferences', JSON.stringify({...user, isLoggedIn: state.isLoggedIn}));
            }
            state.isLoading = false;
        },
        setUser(state,action){
            // Allow setting user data without checking isLoggedIn first
            const {name,email,password,theme,image,isLoggedIn} = action.payload
            if (name) state.name = name;
            if (email) state.email = email;
            if (password) state.password = password;
            if (theme) state.theme = theme;
            if (image) state.image = image;
            if (isLoggedIn !== undefined) state.isLoggedIn = isLoggedIn;
            state.isLoading = false;
        },
        logout(state){
            console.log("Logging out user",state.isLoggedIn);
            if (state.isLoggedIn) {
                state.name = '';    
                state.email = '';
                state.password = '';
                state.image = '';
                state.isLoggedIn = false;
            }
        }
    }
})

export const { setUser,logout,auth } = userSlice.actions;
export default userSlice.reducer;