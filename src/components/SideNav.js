import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./SideNav.css";

export default class SideNav extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
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
      </div>
    );
  }
}
