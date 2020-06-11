/*global chrome*/
import React, { Component } from "react";
import M from "materialize-css";
import "./NavBar.css";

export default class NavBar extends Component {
  /**
   * Init the current component
   * @author : Karl Wang
   */
  componentDidMount() {
    M.AutoInit();
  }

  /**
   * Create the setting page and set
   * the url to popup.html
   * @author : Karl Wang
   */
  openSettingsPage = () => {
    chrome.tabs.create({ url: "/popup.html" });
  };

  /**
   * render the navbar component
   * @author : Karl Wang
   */
  render() {
    return (
      <div>
        {/* <!-- Navbar goes here --> */}
        <nav id="nav-background">
          <div className="nav-wrapper">
            <a href="#" id="team-name" className="left">
              Team Activity Tracker
            </a>
            <ul className="right">
              <li>
                <a id="adjust-height" href="#" onClick={this.openSettingsPage}>
                  <i id="adjust-height" className="material-icons">
                    settings
                  </i>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    );
  }
}
