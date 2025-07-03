import React from "react";
import Home from "./pages/home";
import Grades from "./pages/grades";
import DeepLink from "./pages/deeplink";
import LandingPage from "./pages/landingPage";
import Dashboard from "./pages/dashboard";
import NameRoles from "./pages/nameRoles";
import AudioSubmission from "./pages/audioSubmission";
import Assignment from "./pages/assignment";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "20px",
      }}
    >
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/grades">
            <Grades />
          </Route>
          <Route path="/deeplink">
            <DeepLink />
          </Route>
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          <Route path="/nameRoles">
            <NameRoles />
          </Route>
          <Route path="/audio">
            <AudioSubmission />
          </Route>
          <Route path="/assignment">
            <Assignment />
          </Route>
          <Route path="/nolti">
            <LandingPage />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}
