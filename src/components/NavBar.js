/*global chrome*/
import React, { Component } from "react";
import M from "materialize-css";
import "./NavBar.css";

export default class NavBar extends Component {
  componentDidMount() {
    M.AutoInit();
  }

  settings = () => { chrome.tabs.create({ url: "popup.html" }); }; 
  render() {
    return (
      <div>
        {/* <!-- Navbar goes here --> */}
        <nav id="nav-background">
          <div className="nav-wrapper">
            <a href="#" className="brand-logo">
              Team 1
            </a>
            <ul className="right">
            <i onClick={this.settings} class="material-icons"> settings </i> 
            </ul>
          </div>
        </nav>
      </div>
    );
  }
}
