import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./redux/features/userSlice";
import type { RootState } from './redux/store';

const App = () => {
  const dispatch = useDispatch();
  const { isLoading, theme } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme || 'dark');
  }, [theme]);

  useEffect(() => {
    const storedUser = localStorage.getItem('app_preferences');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser && parsedUser.isLoggedIn) {
        dispatch(setUser({ ...parsedUser }));
      } else {
        dispatch(setUser({ isLoggedIn: false }));
      }
    } else {
      dispatch(setUser({ isLoggedIn: false }));
    }
  }, [dispatch]);

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
