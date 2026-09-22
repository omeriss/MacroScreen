import React from "react";
import ReactDOM from "react-dom/client";
import MainPage from "./pages/MainPage/MainPage";
import "./styles/global.css";
import { RecoilRoot } from "recoil";
import { ToastContainer } from "react-toastify";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <MainPage />
      <ToastContainer />
    </RecoilRoot>
  </React.StrictMode>
);
