import React, { Component } from "react";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
import "rsuite/dist/styles/rsuite-default.css";
import "./components/materialize.min.css";
import CreateJoinTeam from "./components/CreateJoinTeam";
import NavBar from "./components/NavBar";
import SideNav from "./components/SideNav";
import "./App.css";
import Teams from "./components/Teams";
import Home from "./components/Home";
import Timeline from "./components/Timeline";
import Charts from "./components/Charts";

// for Testing purpose
class App extends Component {
  render() {
    return (
      <div className="app">
        <Router>
          {/* NavBar should always be shown for all pages */}
          <NavBar></NavBar>
          <div className="row">
            {/* save spaces for the side navbar */}
            <div className="col s1" id="side">
              <SideNav></SideNav>
            </div>
            {/* This is where the real component is at */}
            <div className="col s11" id="home-component component">
              <Switch>
                {/* follow the following examples for adding new component */}
                <Route
                  exact
                  path="/createjoin"
                  component={CreateJoinTeam}
                ></Route>
                <Route exact path="/teams" component={Teams}></Route>
                <Route exact path="/timeline" component={Timeline}></Route>
                <Route exact path="/charts" component={Charts}></Route>
                <Route path="/" component={Home}></Route>
              </Switch>
            </div>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
