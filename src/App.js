/*global chrome*/
import React, { Component } from "react";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
import CreateJoinTeam from "./components/CreateJoinTeam";
import NavBar from "./components/NavBar";
import "./components/materialize.min.css";
import SideNav from "./components/SideNav";
import "./App.css";
import Teams from "./components/Teams";
import Home from "./components/Home";
import Timeline from "./components/Timeline";

class App extends Component {
  render() {
    return (
      <div className="app">
        <Router>
          <NavBar></NavBar>
          <div className="row">
            <div className="col s2" id="side">
              <SideNav></SideNav>
            </div>
            <div className="col s10">
              <Switch>
                <Route
                  exact
                  path="/createjoin"
                  component={CreateJoinTeam}
                ></Route>
                <Route exact path="/teams" component={Teams}></Route>
                <Route exact path="/timeline" component={Timeline}></Route>
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
