import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./redux/features/userSlice";

const App = () => {

  const dispatcher = useDispatch();
  const isLoading = useSelector((state) => state?.user?.isLoading);

  useEffect(()=>{
    function fetchUserFromStorage() {
      const storedUser = localStorage.getItem('app_preferences');
      const parsedUser = JSON.parse(storedUser);
      if (storedUser && parsedUser.isLoggedIn) {
        // Explicitly set isLoggedIn to true when restoring from storage
        dispatcher(setUser({...parsedUser}));
        console.log("App - user state:", parsedUser);
      } else {
        // No user in storage, mark loading as complete
        dispatcher(setUser({isLoggedIn:false}));
      }
    }
    fetchUserFromStorage();
  },[dispatcher])

  // Show loading while fetching from localStorage
  if (isLoading) {
    return <div className="w-full h-screen bg-zinc-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <div className="w-full h-screen bg-zinc-100">
        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<Chat />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
