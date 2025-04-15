import { BrowserRouter as Router, Routes, Route } from "react-router";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SearchPage from "./pages/SearchPage";
import PageDetail from "./pages/PageDetail";
import ThemeSwitcher from "./components/ThemeSwitcher";
import { ThemeContext } from "./contexts/ThemeContext";
import "./styles/theme.css";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

function App() {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme") || (prefersDarkMode ? "dark" : "light");
    setThemeMode(savedTheme as "light" | "dark");
    document.documentElement.setAttribute("data-color-mode", savedTheme);
  }, [prefersDarkMode]);

  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider
        value={{ theme: themeMode, setTheme: setThemeMode }}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <ThemeSwitcher />
            <Routes>
              <Route path="/" element={<SearchPage />} />
              <Route path="/page/:pageId" element={<PageDetail />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
