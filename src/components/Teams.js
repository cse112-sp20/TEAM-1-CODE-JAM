/* global chrome */
import React, { Component } from "react";
import "./Teams.css";
import M from "materialize-css";
import CreateJoinTeam from "./CreateJoinTeam";
import { withRouter } from "react-router-dom";

class Teams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teams: [],
    };
  }
  componentWillUnmount = () => {
    M.Toast.dismissAll();
  };

  componentDidMount = () => {
    M.AutoInit();
    this.getTeams();
    this.setupButtonListener();

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
  setupButtonListener = () => {
    document.querySelector("body").addEventListener("click", (e) => {
      if (e.target.classList.contains("undo")) {
        let teamCode = e.target.value;
        let msg = {
          for: "background",
          message: "clear timeout",
          teamCode: teamCode,
        };
        chrome.runtime.sendMessage(msg);
        let team = this.state.teams.find((team) => team.teamCode === teamCode);
        if (team) {
          team.visable = true;
          this.setState({
            teams: this.state.teams,
          });
        }
        let toastElement = document.querySelector(".toast" + teamCode);
        console.log(toastElement);
        let toastInstance = M.Toast.getInstance(toastElement);
        toastInstance.dismiss();
      }
    });
  };
  getTeams = () => {
    let msg = { for: "background", message: "get teams" };
    chrome.runtime.sendMessage(msg, (response) => {
      response.forEach((element) => {
        element.visable = true;
      });
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
  onRemoveTeam = (team) => {
    team.visable = false;
    this.setState({
      teams: this.state.teams,
    });
    let toastHTML = `<span>You are removed from "${team.teamName}"</span>
                     <button value="${team.teamCode}" class="undo btn-flat toast-action">Undo</button>`;

    M.toast({
      html: toastHTML,
      classes: "toast" + team.teamCode,
      // displayLength: 4000,
    });
    let msg = {
      for: "background",
      message: "set timeout to delete team",
      teamCode: team.teamCode,
    };
    chrome.runtime.sendMessage(msg);
  };

  render() {
    return (
      <div className="row">
        {this.state.teams.map((team) => {
          if (!team.visable) return;

          return (
            <div className="col s3" id="team-and-delete">
              {/* This is the button of each team */}
              <button
                onClick={this.onClickTeam.bind(this, team)}
                teamCode={team.teamCode}
                className="rounded-btn waves-effect waves-light btn"
              >
                <div className="inside-btn">
                  <text className="flexbox-centering">{team.teamName}</text>
                </div>
              </button>
              <button
                onClick={this.onRemoveTeam.bind(this, team)}
                className="btn-floating btn-small waves-effect waves-light red accent-2"
                id="delete"
              >
                <i className="material-icons">remove</i>
              </button>
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
            data-testid="Teams-createjoin"
          >
            <div className="inside-btn">
              <text className="flexbox-centering">
                {/* using icon add */}
                <i id="add-btn" className="material-icons">
                  add
                </i>
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
