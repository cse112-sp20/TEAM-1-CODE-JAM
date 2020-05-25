/*global chrome*/
import React, { Component } from "react";
import M from "materialize-css";
// import { Timeline, TimelineBlip } from "react-event-timeline";
import { Timeline, Icon } from "rsuite";

import "./Home.css";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teamPoints: 100,
      teamCode: "",
      teamName: "",
      teamMembers: [],
      currWebsite: "facebook",
    };
  }
  /**
   * Get the information of the current selected team
   * @author Karl Wang
   *
   */
  componentDidMount = async () => {
    M.AutoInit();

    var elems = document.querySelectorAll(".dropdown-trigger");
    M.Dropdown.init(elems, {
      constrainWidth: false,
      hover: true,
      autoTrigger: false,
      closeOnClick: false,
    });

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
    let profilePic = require("../images/emojis/Predator.svg");
    let leftSide = (
      <div id="col" className="col s4">
        <img id="profile" className="responsive-img circle" src={profilePic} />
      </div>
    );
    let rightSide = (
      <div className="col s8">
        <span
          id="title"
          className="truncate card-title black-text center-align"
        >
          {this.state.teamName}
        </span>
        <div className="divider"></div>
        <div className="row">
          <div id="col" className="col s4">
            <p id="top" className="center-align">
              {this.state.teamCode}
            </p>
            <p
              id="bottom"
              className="center-align blue-grey-text text-darken-1"
            >
              Code
            </p>
          </div>
          <div id="col" className="col s4">
            <p id="top" className="center-align">
              {this.state.teamMembers.length}
            </p>
            <p
              id="bottom"
              className="center-align dropdown-trigger blue-grey-text text-darken-1"
              data-target="people"
            >
              Members
            </p>
            {/* <!-- Dropdown Structure --> */}
            <ul id="people" className="dropdown-content collection">
              {this.state.teamMembers.map((teamMember) => {
                return <li className="collection-item">{teamMember}</li>;
              })}
            </ul>
          </div>

          <div id="col" className="col s4">
            <p id="top" className="center-align">
              {this.state.teamPoints}
            </p>
            <p
              id="bottom"
              className="center-align blue-grey-text text-darken-1"
            >
              Points
            </p>
          </div>
        </div>
      </div>
    );
    let addToBlackList = (
      <div id="col" className="col s6">
        <span className="left black-text truncate">
          {this.state.currWebsite}
        </span>
        <div id="blacklist" className="switch right">
          <label>
            <input type="checkbox" />
            <span className="lever"></span>
          </label>
        </div>
      </div>
    );
    let checkIn = (
      <div id="col" className="col s6">
        <span className="left black-text">Check In</span>
        <div id="checkin" className="switch right">
          <label>
            <input type="checkbox" />
            <span className="lever"></span>
          </label>
        </div>
      </div>
    );
    let exampleNode = (
      <div id="example" className="row">
        <div id="col" className="col s2">
          <img src={profilePic} />
        </div>
        <div id="col" className="col s6">
          <p>Facebook</p>
        </div>
        <div id="col" className="col s4">
          <p>+20 Points</p>
        </div>
      </div>
    );
    // let timeline = (
    //   <Timeline>
    //     <TimelineBlip
    //       title={exampleNode}
    //       icon={<i className="material-icons">brightness_1</i>}
    //       iconColor="#95d44c"
    //     ></TimelineBlip>
    //   </Timeline>
    // );
    let timeline = (
      <Timeline>
        <Timeline.Item
          dot={<Icon icon="check-circle" style={{ color: "green" }} />}
        >
          <p>2018-03-01</p>
          <p>Your order starts processing</p>
        </Timeline.Item>
        <Timeline.Item
          dot={<Icon icon="exclamation-triangle" style={{ color: "orange" }} />}
        >
          <p>2018-03-02</p>
          <p>Order out of stock</p>
        </Timeline.Item>
        <Timeline.Item
          dot={<Icon icon="info-circle" style={{ color: "blue" }} />}
        >
          <p>2018-03-10</p>
          <p>Arrival</p>
        </Timeline.Item>
        <Timeline.Item
          dot={<Icon icon="check-circle" style={{ color: "green" }} />}
        >
          <p>2018-03-12</p>
          <p>Order out of the library</p>
        </Timeline.Item>
        <Timeline.Item
          dot={<Icon icon="spinner" spin style={{ borderRadius: "50%" }} />}
        >
          <p>2018-03-15</p>
          <p>Sending you a piece</p>
        </Timeline.Item>
      </Timeline>
    );

    return (
      <div>
        <div id="row" className="row">
          <div className="card blue-grey lighten-5">
            <div id="card-content" className="card-content black-text">
              <div className="row">
                {leftSide}
                {rightSide}
              </div>
              <div className="card-action">
                <div className="row">
                  {addToBlackList}
                  {checkIn}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="row" className="row">
          {/* <div className="card blue-grey lighten-5">{timeline}</div> */}
        </div>
      </div>
    );
  }
}
