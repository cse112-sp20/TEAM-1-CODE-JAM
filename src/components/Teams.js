/* global chrome */
import React, { Component } from "react";
import "./Teams.css";
import M from "materialize-css";
import CreateJoinTeam from "./CreateJoinTeam";
import { Redirect, Link, withRouter } from "react-router-dom";

class Teams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teams: [],
    };
  }
  componentDidMount = () => {
    M.AutoInit();
    this.getTeam();
  };
  getTeam = () => {
    let msg = { for: "background", message: "get teams" };
    chrome.runtime.sendMessage(msg, (response) => {
      this.setState({
        teams: response,
      });
    });
  };
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
          <a
            href="#modal-createjoin"
            className="rounded-btn waves-effect waves-light btn tooltipped modal-trigger"
            data-position="bottom"
            data-tooltip="Create or join a new team"
          >
            <div className="inside-btn">
              <text className="flexbox-centering">
                <i className="material-icons">add</i>
              </text>
            </div>
          </a>
          <div id="modal-createjoin" className="modal">
            <div className="modal-content">
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
      </div>
    );
  }
}

export default withRouter(Teams);
