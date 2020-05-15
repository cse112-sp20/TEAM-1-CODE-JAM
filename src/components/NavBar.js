import React, { Component } from "react";
import M from "materialize-css";
import "./materialize.min.css";
import "./NavBar.css";


export default class NavBar extends Component {
  componentDidMount() {
    M.AutoInit();
  }

  render() {
    return (
      <div>
        {/* <!-- Navbar goes here --> */}
        <nav>
          <div className="nav-wrapper">
            <a href="#" className="brand-logo">
              Logo
            </a>
            <ul id="nav-mobile" className="right hide-on-med-and-down">
              <li>
                <a href="sass.html">Sass</a>
              </li>
              <li>
                <a href="badges.html">Components</a>
              </li>
              <li>
                <a href="collapsible.html">JavaScript</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    );
  }
}
