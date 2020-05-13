/*global chrome*/
import React, { Component } from "react";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teamCode: "",
      teamName: "",
      teamMembers: [],
    };
  }
  componentDidMount = async () => {
    let task = new Promise((resolve, reject) => {
      chrome.storage.local.get("prevTeam", function (data) {
        resolve(data);
      });
    });
    let data = await task;
    if (!"prevTeam" in data) {
      return;
    }
    console.log(data);
    let msg = {
      for: "background",
      message: "get team info",
      teamCode: data.prevTeam,
    };
    chrome.runtime.sendMessage(msg, (response) => {
      this.setState({
        teamCode: data.prevTeam,
        teamName: response.teamName,
        teamMembers: Object.keys(response.members),
      });
    });
  };
  render() {
    return (
      <div>
        <div className="divider"></div>
        <div className="section">
          <h5>{this.state.teamName}</h5>
          <p>Team Code: {this.state.teamCode}</p>
        </div>
        <div className="divider"></div>
        <div className="section">
          <h5>Team Members</h5>
          {/* {this.state.teamMembers} */}
          {this.state.teamMembers.map((teamMember) => {
            return <p>{teamMember}</p>;
          })}
        </div>
      </div>
    );
  }
}
