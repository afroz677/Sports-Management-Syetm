import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Teams from "./pages/Teams";
import Coaches from "./pages/Coaches";
import Schedules from "./pages/Schedules";
import Venues from "./pages/Venues";
import Attendance from "./pages/Attendance";
import Injuries from "./pages/Injuries";
import Finance from "./pages/Finance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/players" element={<Players />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/injuries" element={<Injuries />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
