/*global chrome*/
import React, { Component } from "react";
import Timeline from "./Timeline";
import Charts from "./Charts";
import M from "materialize-css";
import "./Home.css";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teamCode: "",
      teamName: "",
      teamMembers: [],
    };
  }
  /**
   * Get the information of the current selected team
   * @author Karl Wang
   *
   */
  componentDidMount = async () => {
    M.AutoInit();
    // ask chrome storage for the current team
    // The api is async
    let task = new Promise((resolve, reject) => {
      chrome.storage.local.get("prevTeam", function (data) {
        resolve(data);
      });
    });
    let data = await task;
    // First time logging in
    if (!("prevTeam" in data)) {
      return;
    }
    let msg = {
      for: "background",
      message: "get team info",
      teamCode: data.prevTeam,
    };
    // ask the background for team information
    chrome.runtime.sendMessage(msg, (response) => {
      this.setState({
        teamCode: data.prevTeam,
        teamName: response.teamName,
        teamMembers: response.members,
      });
    });
  };
  render() {
    return (
      <div className="card">
        <div id="card-content" className="card-content blue-grey-text">
          <span
            className="blue-grey-text card-title"
            data-testid="Home-teamname"
          >
            {this.state.teamName}
            <span data-testid="Home-teamcode" className="badge">
              Team Code: {this.state.teamCode}
            </span>
          </span>
        </div>
        <div id="card-content" className="card-content grey lighten-4">
          <div id="teamMembers">
            <ul className="collection">
              {this.state.teamMembers.map((teamMember) => {
                return (
                  <li className="collection-item" data-testid="Home-teammember">
                    {teamMember}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      // <div>
      //   <div className="divider"></div>
      //   <div className="section">
      //     <h5>{this.state.teamName}</h5>
      //     <p>Team Code: {this.state.teamCode}</p>
      //   </div>
      //   <div className="divider"></div>
      //   <div className="section">
      //     <h5>Team Members</h5>
      //     {/* {this.state.teamMembers} */}
      //     {this.state.teamMembers.map((teamMember) => {
      //       return <p>{teamMember}</p>;
      //     })}
      //   </div>
      // </div>
    );
  }
}
