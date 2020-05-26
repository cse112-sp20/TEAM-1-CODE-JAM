/*global chrome*/
import React, { Component } from "react";
import M from "materialize-css";
// import { Timeline, TimelineBlip } from "react-event-timeline";
import { Timeline, Icon, Button } from "rsuite";

import "rsuite/dist/styles/rsuite-default.css";
import "./Home.css";
// const profilePics = require("../images/emojis");

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teamPoints: 100,
      teamCode: "",
      teamName: "",
      teamMembers: [],
      currWebsite: "facebook",
      profilePics: [],
      blacklist: ["youtube", "facebook"],
      isInBlacklist: false,
    };
  }
  /**
   * Get the information of the current selected team
   * @author Karl Wang
   *
   */
  componentDidMount = async () => {
    const profilePics = this.importAll(
      require.context("../images/emojis", false, /\.(png|jpe?g|svg)$/)
    );
    this.setState({ profilePics: profilePics });
    var elems = document.querySelectorAll(".dropdown-trigger");
    // M.AutoInit();
    M.Dropdown.init(elems, {
      constrainWidth: false,
      hover: true,
      autoTrigger: false,
      closeOnClick: false,
    });
    // elems = document.querySelectorAll(".tooltipped");
    // M.Tooltip.init(elems, { html: true });

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
      if (this.state.blacklist.includes(this.state.currWebsite)) {
        this.setState({
          isInBlacklist: true,
        });
      }
    });
  };
  importAll = (r) => {
    return r.keys().map(r);
  };
  onClickBlacklistButton = (e) => {
    if (!this.state.isInBlacklist) {
      this.setState({
        isInBlacklist: true,
      });
    } else {
      this.setState({
        isInBlacklist: false,
      });
    }
    let elems = document.querySelectorAll(".tooltipped");
    M.Tooltip.init(elems, {});
  };
  createBlacklistButton = () => {
    let appearance = "ghost";
    let id = "blacklist-button";
    let tooltipMsg;
    let style = {};
    if (!this.state.isInBlacklist) {
      // appearance = "ghost";
      tooltipMsg = "Add current website to black list";
      style["backgroundColor"] = "transparent";
    } else {
      // appearance = "primary";
      style["backgroundColor"] = "rgba(255, 115, 115, 0.8)";
      style["color"] = "#fff";
      tooltipMsg = "Remove current website from black list";
    }

    return (
      <Button
        onClick={this.onClickBlacklistButton}
        id={id}
        appearance={appearance}
        style={style}
        block
        size="sm"
        className="tooltipped"
        data-html="true"
        data-position="bottom"
        data-tooltip={tooltipMsg}
      >
        {this.state.currWebsite}
      </Button>
    );
  };
  createTimelineItem = (profilePic, website, points) => {
    let isProductive = points[0] === "-" ? false : true;
    let profilePics = this.state.profilePics;
    profilePic = profilePics[Math.floor(Math.random() * profilePics.length)];
    let dotColor;
    let textColor;
    if (isProductive) {
      // dotColor = "#98edaa";
      dotColor = "#52d16d";
      textColor = "#52d16d";
    } else {
      dotColor = "#ff7373";
      textColor = dotColor;
    }
    const paddingTop = "11px";
    return (
      <Timeline.Item
        dot={
          <Icon
            id="dot-icon"
            size="lg"
            icon="circle"
            style={{ color: dotColor }}
          />
        }
      >
        <div id="example" className="row">
          <div id="col" className="col s1"></div>
          <div id="col" className="col s2">
            <img src={profilePic} className="circle" />
          </div>
          <div id="col" className="col s1"></div>
          <div id="col" className="col s5">
            <p
              style={{
                textTransform: "capitalize",
                fontWeight: 600,
                paddingTop: paddingTop,
              }}
            >
              {website}
            </p>
          </div>
          <div id="col" className="col s3">
            <p
              style={{
                fontWeight: 600,
                color: textColor,
                paddingTop: paddingTop,
              }}
            >
              {points} Points
            </p>
          </div>
        </div>
      </Timeline.Item>
    );
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
        {this.createBlacklistButton()}
      </div>
    );
    let checkIn = (
      <div id="col" className="col s6">
        {/* <span className="left black-text">Check In</span> */}
        <div id="checkin" className="switch right">
          <label>
            Check off
            <input type="checkbox" />
            <span className="lever"></span>
            Check in
          </label>
        </div>
      </div>
    );
    let timeline = (
      <div id="mini-timeline">
        <Timeline>
          {this.createTimelineItem(profilePic, "facebook", "-30")}
          {this.createTimelineItem(profilePic, "github commit", "+30")}
          {this.createTimelineItem(profilePic, "youtube", "-30")}
          {this.createTimelineItem(profilePic, "myspace", "-30")}
          {this.createTimelineItem(profilePic, "github commit", "+30")}
        </Timeline>
      </div>
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
          <div
            id="mini-timeline-wrapper"
            className="valign-wrapper card blue-grey lighten-5"
          >
            {timeline}
          </div>
        </div>
      </div>
    );
  }
}
