/*global chrome*/
import React, { Component } from "react";
import M from "materialize-css";
import "./NavBar.css";

export default class NavBar extends Component {
  componentDidMount() {
    M.AutoInit();
  }

  openSettingPage = () => {
    chrome.tabs.create({ url: "/popup.html" });
  };

  render() {
    return (
      <div>
        {/* <!-- Navbar goes here --> */}
        <nav id="nav-background">
          <div className="nav-wrapper">
            <a id="team-name" className="left">
              Team Activity Tracker
            </a>
            <ul className="right">
              <li>
                <a onClick={this.openSettingPage}>Settings</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    );
  }
}
