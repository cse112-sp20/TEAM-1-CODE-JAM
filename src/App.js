<<<<<<< HEAD
import React, { Component } from "react";
import {
  Route,
  Switch,
  BrowserRouter as Router,
  withRouter,
} from "react-router-dom";
=======
/*global chrome*/
import React, { Component } from "react";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
>>>>>>> timeline
import CreateJoinTeam from "./components/CreateJoinTeam";
import NavBar from "./components/NavBar";
import "./components/materialize.min.css";
import SideNav from "./components/SideNav";
import "./App.css";
import Teams from "./components/Teams";
import Home from "./components/Home";
import Timeline from "./components/Timeline";

<<<<<<< HEAD
// for Testing purpose
=======
>>>>>>> timeline
class App extends Component {
  render() {
    return (
      <div className="app">
        <Router>
<<<<<<< HEAD
          {/* NavBar should always be shown for all pages */}
          <NavBar></NavBar>
          <div className="row">
            {/* save spaces for the side navbar */}
            <div className="col s2" id="side">
              <SideNav></SideNav>
            </div>
            {/* This is where the real component is at */}
            <div className="col s10" id="component">
              <Switch>
                {/* follow the following examples for adding new component */}
=======
          <NavBar></NavBar>
          <div className="row">
            <div className="col s2" id="side">
              <SideNav></SideNav>
            </div>
            <div className="col s10" id="component">
              <Switch>
>>>>>>> timeline
                <Route
                  exact
                  path="/createjoin"
                  component={CreateJoinTeam}
                ></Route>
                <Route exact path="/teams" component={Teams}></Route>
                <Route exact path="/timeline" component={Timeline}></Route>
<<<<<<< HEAD
=======

>>>>>>> timeline
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
