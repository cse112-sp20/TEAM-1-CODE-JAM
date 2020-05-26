/*global chrome*/
import React, { Component } from "react";
import M from "materialize-css";
import { withRouter } from "react-router-dom";
import "./CreateJoinTeam.css";
// var $ = require("jquery");

class CreateJoinTeam extends Component {
  /**
   * Setup materialize ui and button listener
   * @author Karl Wang
   */
  componentDidMount = () => {
    this.setupButtonListener();
  };

  /**
   * Setup the listener for create team and join team button
   * @author : Karl Wang
   */
  setupButtonListener = () => {
    let createButton = document.querySelector("#createButton");
    createButton.addEventListener("click", this.onCreateTeam);
    let joinButton = document.querySelector("#joinButton");
    joinButton.addEventListener("click", this.onJoinTeam);
  };

  /**
   * Send the team name to background, which handles create team on database
   * Do preliminary checking if the team name is legit
   * @author : Karl Wang
   */
  onCreateTeam = () => {
    let teamName = document.querySelector("#teamName").value;
    //   team name is empty
    if (teamName === "") {
      M.toast({ html: "Team name cannot be empty!", displayLength: 2000 });
      return;
    }
    let msg = {
      for: "background",
      message: "create team",
      teamName: teamName,
    };
    //   send to background page
    chrome.runtime.sendMessage(msg, (response) => {
      this.props.redirect(response);
    });
  };
  /**
   * Send the request along with the team code to background page
   * Do preliminary checking to see if the team code is valid
   * @author : Karl Wang
   */
  onJoinTeam = () => {
    let teamCode = document.querySelector("#teamCode").value;
    teamCode = teamCode.toUpperCase();
    if (teamCode.length !== 5) {
      M.toast({
        html: "Team code should be 5 characters!",
        displayLength: 2000,
      });
      return;
    }
    //   check if it only contains alphabets and numbers
    const regex = /^[A-Z0-9]+$/i;
    if (!regex.test(teamCode)) {
      M.toast({
        html: "Team code should only contains alphabets and numbers",
        displayLength: 2000,
      });
      return;
    }

    let msg = {
      for: "background",
      message: "join team",
      teamCode: teamCode,
    };
    chrome.runtime.sendMessage(msg, (response) => {
      if (response === "team code not found") {
        M.toast({
          html: "Team code does not exist!",
          displayLength: 2000,
        });
        return;
      } else if (response === "success") {
        this.props.redirect(teamCode);
        return;
      } else if (response === "already joined the group") {
        M.toast({
          html: "You have already joined this group",
          displayLength: 2000,
        });
        return;
      }
    });
  };

  render() {
    return (
      <div>
        <div className="row">
          <div className="col s12">
            <ul id="body" className="tabs">
              <li className="tab col s6">
                {/* <!-- First Tab --> */}
                <a className="active" href="#createTeam">
                  Create Team
                </a>
              </li>
              <li className="tab col s6">
                {/* <!-- Second Tab --> */}
                <a href="#joinTeam">Join Team</a>
              </li>
            </ul>
          </div>
          <div id="createTeam" className="col s12">
            {/* <!-- Target of first tab -->
        <!-- Row for Team Name --> */}
            <div className="row">
              <div className="input-field col s12">
                <input
                  id="teamName"
                  type="text"
                  className="validate"
                  data-testid="CreateJoinTeam-createinput"
                />
                <label for="teamName">Team Name</label>
              </div>
            </div>
            {/* <!-- Row for CREATE --> */}
            <div className="row center-align">
              <div className="col s12">
                <button
                  id="createButton"
                  className="waves-effect waves-light btn-large red accent-1"
                  data-testid="CreateJoinTeam-createbutton"
                >
                  Create
                </button>
              </div>
            </div>
          </div>

          {/* <!-- Target for the second tab --> */}
          <div id="joinTeam" className="col s12">
            {/* <!-- second tab input team code --> */}
            <div className="row">
              <div className="input-field col s12">
                <input
                  maxlength="5"
                  id="teamCode"
                  type="text"
                  className="validate"
                />
                <label for="teamCode">Team Code</label>
              </div>
            </div>

            {/* <!-- Row for JOIN --> */}
            <div className="row center-align">
              <div className="col s12">
                <button
                  id="joinButton"
                  className="waves-effect waves-light btn-large red accent-1"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(CreateJoinTeam);
