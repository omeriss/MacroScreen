import React from "react";
import ReactDOM from "react-dom/client";
import MainPage from "./pages/MainPage/MainPage";
import "./styles/global.css";
import { RecoilRoot } from "recoil";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <MainPage />
    </RecoilRoot>
  </React.StrictMode>
);
