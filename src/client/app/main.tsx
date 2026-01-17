import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import store from "../store/store";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "../pages/Index/Index";
import NotFound from "@client/pages/NotFound/NotFound";
import "./main.scss";

// socketTest();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </Provider>
  </StrictMode>
);