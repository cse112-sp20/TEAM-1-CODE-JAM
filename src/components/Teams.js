/* global chrome */
import React, { Component } from "react";
import "./Teams.css";
import M from "materialize-css";
import CreateJoinTeam from "./CreateJoinTeam";
import { withRouter } from "react-router-dom";
// import $ from "jquery";

class Teams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teams: [],
    };
  }
  componentDidMount = () => {
    M.AutoInit();
    this.getTeams();

    // document.addEventListener("DOMContentLoaded", function () {
    //   let elems = document.querySelectorAll(".tabs");
    //   let instances = M.Tabs.getInstance(elems);
    //   instances.select("joinTeam");
    // });
  };
  /**
   * getTeams asks the background js for all the teams of the current user
   * @author Karl Wang
   */
  getTeams = () => {
    let msg = { for: "background", message: "get teams" };
    chrome.runtime.sendMessage(msg, (response) => {
      this.setState({
        teams: response,
      });
    });
  };
  /**
   * This will redirect the page to home team with the clicked team information.
   * @author Karl Wang
   * @param {Object} team the team that was clicked
   */
  onClickTeam = (team) => {
    chrome.storage.local.set({ prevTeam: team.teamCode });
    this.props.history.push("/" + team.teamCode);
  };

  render() {
    return (
      <div className="row">
        {this.state.teams.map((team) => {
          return (
            <div className="col s3">
              {/* This is the button of each team */}
              <a
                onClick={this.onClickTeam.bind(this, team)}
                teamCode={team.teamCode}
                className="rounded-btn waves-effect waves-light btn"
              >
                <div className="inside-btn">
                  <text className="flexbox-centering">{team.teamName}</text>
                </div>
              </a>
            </div>
          );
        })}
        <div className="col s3">
          {/* This is the button for adding new team */}
          <a
            href="#modal-createjoin"
            className="rounded-btn waves-effect waves-light btn tooltipped modal-trigger"
            data-position="bottom"
            data-tooltip="Create or join a new team"
          >
            <div className="inside-btn">
              <text className="flexbox-centering">
                {/* using icon add */}
                <i className="material-icons">add</i>
              </text>
            </div>
          </a>
        </div>
        <div id="modal-createjoin" className="modal">
          <div className="modal-content">
            {/* render modal when clicked on add Button */}
            <CreateJoinTeam></CreateJoinTeam>
          </div>
          <div className="modal-footer">
            <a
              href="#!"
              className="modal-close waves-effect waves-green btn-flat"
            >
              Close
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Teams);
