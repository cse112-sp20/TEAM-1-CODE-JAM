import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./SideNav.css";

export default class SideNav extends Component {
  render() {
    return (
      <div className="SideNav">
        <Link
          className="grey darken-3 waves-effect waves-light card-panel center-align"
          to="/"
        >
          <span>Home</span>
        </Link>
        <Link
          className="grey darken-3 waves-effect waves-light card-panel center-align"
          to="/teams"
        >
          <span>Teams</span>
        </Link>
        <Link
          className="grey darken-3 waves-effect waves-light card-panel center-align"
          to="/timeline"
        >
          <span>Timeline</span>
        </Link>
      </div>
    );
  }
}
