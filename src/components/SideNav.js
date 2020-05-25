import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import "./SideNav.css";

export default class SideNav extends Component {
  render() {
    return (
      <div className="SideNav">
        <NavLink
          className="btn tooltipped waves-effect waves-light card-panel center-align"
          id="sidenav-background"
          data-position="right"
          data-tooltip="Home"
          to="/"
        >
          {/* <span>Home</span> */}
          <i className="large white-text material-icons">home</i>
        </NavLink>
        <NavLink
          className="btn tooltipped waves-effect waves-light card-panel"
          id="sidenav-background"
          data-position="right"
          data-tooltip="Timeline"
          to="/timeline"
        >
          {/* <span>Timeline</span> */}
          <i className="white-text material-icons">access_time</i>
        </NavLink>
        <NavLink
          className="btn tooltipped waves-effect waves-light card-panel center-align"
          id="sidenav-background"
          data-position="right"
          data-tooltip="Charts"
          to="/charts"
        >
          {/* <span>Charts</span> */}
          <i className="white-text material-icons">insert_chart</i>
        </NavLink>
        <NavLink
          className="btn tooltipped waves-effect waves-light card-panel center-align"
          id="sidenav-background"
          data-position="right"
          data-tooltip="timeline"
          to="/timelinedemo"
        >
          <span>demo</span>
          {/* <i className="white-text material-icons">insert_chart</i> */}
        </NavLink>
        <NavLink
          className="btn tooltipped waves-effect waves-light card-panel center-align"
          id="sidenav-background"
          data-position="right"
          data-tooltip="Teams"
          data-testid="SideNav-teams"
          to="/teams"
        >
          {/* <span>Teams</span> */}
          <i className="white-text material-icons">group_add</i>
        </NavLink>
      </div>
    );
  }
}
