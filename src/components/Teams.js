/* global chrome */
import React, { Component } from "react";
import "./Teams.css";
import M from "materialize-css";
import CreateJoinTeam from "./CreateJoinTeam";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";

class Teams extends Component {
  /**
   * initialize team list and display the tabs of teams
   * @author: Karl Wang
   * @param {Obejct} props list of attributes the set the component with
   */
  constructor(props) {
    super(props);
    this.state = {
      teams: [],
      tabsInstance: undefined,
    };
  }
  /**
   * Unmount this component
   * @author: Karl Wang
   */
  componentWillUnmount = () => {
    M.Toast.dismissAll();
  };

  /**
   * Mount this Component, set up the query, and wait
   * for user input in the team menu
   * @author: Karl Wang
   */
  componentDidMount = () => {
    M.AutoInit();
    this.getTeams();
    this.setupButtonListener();
    let elem = document.querySelector(".tabs");
    let tabsInstance = M.Tabs.init(elem);
    elem = document.querySelectorAll(".modal");
    M.Modal.init(elem, {
      onOpenStart: () =>
        setTimeout(() => tabsInstance.updateTabIndicator(), 200),
    });
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
        let toastInstance = M.Toast.getInstance(toastElement);
        toastInstance.dismiss();
      }
    });
  };

  /**
   * get the list of teams and re render them
   * @author: Karl Wang
   */
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
   * @param {Object} teamCode the team that was clicked
   */
  onClickTeam = (teamCode) => {
    chrome.storage.local.set({ prevTeam: teamCode }, () => this.redirect());
  };
  /**
   * Redirect user to their team home page
   * @author: Karl Wang
   */
  redirect = () => {
    let msg = {
      for: "background",
      message: "switch team",
    };
    chrome.runtime.sendMessage(msg, (response) => {
      if (response === "success") {
        this.props.history.push("/");
      }
    });
  };
  /**
   * remove the current team from the user list
   * of teams
   * @param {string} team team name to remove
   */
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
    });
    let msg = {
      for: "background",
      message: "set timeout to delete team",
      teamCode: team.teamCode,
    };
    chrome.runtime.sendMessage(msg);
  };

  /**
   * render the teams menu
   * @author: Karl Wang
   */
  render() {
    return (
      <div className="row">
        {this.state.teams.map((team, index) => {
          if (!team.visable) return;

          return (
            <div key={team.teamCode} className="col s3" id="team-and-delete">
              {/* This is the button of each team */}
              <button
                onClick={this.onClickTeam.bind(this, team.teamCode)}
                // teamCode={team.teamCode}
                className="rounded-btn waves-effect waves-light btn"
              >
                <div className="inside-btn">
                  <span
                    className="flexbox-centering"
                    data-testid={"team name " + (index + 1)}
                  >
                    {team.teamName}
                  </span>
                </div>
              </button>
              {/* delete button */}
              <button
                className="btn-floating btn-small waves-effect waves-light red accent-2"
                id="delete"
                onClick={this.onRemoveTeam.bind(this, team)}
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
              <span className="flexbox-centering">
                {/* using icon add */}
                <i id="add-btn" className="material-icons">
                  add
                </i>
              </span>
            </div>
          </a>
        </div>
        <div id="modal-createjoin" className="modal">
          <div className="modal-content">
            {/* render modal when clicked on add Button */}
            <CreateJoinTeam redirect={this.onClickTeam}></CreateJoinTeam>
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
Teams.propTypes = {
  history: PropTypes.object,
};

export default withRouter(Teams);
