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
              Team 1
            </a>
            <ul className="right">
              <li>
                <a href="#">About</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    );
  }
}
