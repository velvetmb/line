import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BoardThemeProvider } from "./contexts/BoardThemeContext";
import { BallThemeProvider } from "./contexts/BallThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <ErrorBoundary>
      <WouterRouter base={base}>
        <ThemeProvider defaultTheme="light">
          <BoardThemeProvider>
            <BallThemeProvider>
              <TooltipProvider>
                <Router />
              </TooltipProvider>
            </BallThemeProvider>
          </BoardThemeProvider>
        </ThemeProvider>
      </WouterRouter>
    </ErrorBoundary>
  );
}

export default App;
