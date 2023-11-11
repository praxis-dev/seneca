import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import { store } from "./store";

import Header from "./components/Header/Header";
import QueryResponse from "./pages/QueryResponse/QueryResponse";
import Landing from "./pages/Landing/Landing";

import "./App.css";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Monospace",
          fontSize: 14,
        },
      }}
    >
      <Router>
        <Provider store={store}>
          <div className="App">
            <RouteRender />
          </div>
        </Provider>
      </Router>
    </ConfigProvider>
  );
}

function RouteRender() {
  let location = useLocation();

  return (
    <>
      {location.pathname !== "/landing" && <Header />}
      <Routes>
        <Route path="/" element={<QueryResponse />} />
        <Route path="/landing" element={<Landing />} />
      </Routes>
    </>
  );
}

export default App;
