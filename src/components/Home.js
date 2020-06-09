/*global chrome*/
import React, { Component } from "react";
import M from "materialize-css";
import { Timeline, Icon, Button } from "rsuite";
import "./Home.css";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      teamPoints: 100,
      teamCode: "",
      teamName: "",
      teamMembers: [],
      currUrl: "unknown website",
      profilePics: [],
      blacklist: ["youtube", "facebook"],
      isInBlacklist: false,
      isCheckIn: false,
      timelineArr: [],
      profilePic: "Predator",
    };
  }
  /**
   * Get the information of the current selected team
   * @author Karl Wang
   *
   */
  componentDidMount = async () => {
    const profilePics = this.importAll(
      require.context("../SVG", false, /\.(png|jpe?g|svg)$/)
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

    // ask chrome storage for the current team
    // The api is async
    let msg = {
      for: "background",
      message: "get home info",
    };
    // ask the background for team information
    chrome.runtime.sendMessage(msg, (response) => {
      if (response.currTeamCode == undefined) return;
      let teamInfo = response.teamInfo;
      let timelineArr = teamInfo.timeWasted.reverse();
      if (timelineArr.length > 5) timelineArr = timelineArr.slice(0, 5);
      let isInBlacklist = response.blacklist.includes(response.currUrl);
      let teamPoints = this.roundNumber(teamInfo.teamPoints);
      this.setState({
        teamCode: response.currTeamCode,
        currUrl: response.currUrl,
        isInBlacklist: isInBlacklist,
        isCheckIn: response.isCheckIn,
        blacklist: response.blacklist,
        teamName: teamInfo.teamName,
        teamMembers: teamInfo.members,
        teamPoints: teamPoints,
        timelineArr: timelineArr,
        profilePic: response.profilePic,
      });
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.for === "team info") {
          let teamInfo = msg.message;
          let timelineArr = teamInfo.timeWasted.reverse();
          if (timelineArr.length > 5) timelineArr = timelineArr.slice(0, 5);
          let teamPoints = this.roundNumber(teamInfo.teamPoints);
          this.setState({
            teamName: teamInfo.teamName,
            teamMembers: teamInfo.members,
            teamPoints: teamPoints,
            timelineArr: timelineArr,
            profilePic: teamInfo.userAnimal,
          });
        }
      });
    });
  };
  importAll = (r) => {
    return r.keys().map(r);
  };
  onClickBlacklistButton = () => {
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
        className="tooltipped truncate"
        data-html="true"
        data-position="bottom"
        data-tooltip={tooltipMsg}
      >
        {this.state.currUrl}
      </Button>
    );
  };
  handleCheckIn = () => {
    this.setState({
      isCheckIn: !this.state.isCheckIn,
    });
    let msg = {
      for: "background",
      message: "toggle check in",
    };
    chrome.runtime.sendMessage(msg);
  };
  createTimelineItem = (profilePicName, website, points) => {
    let isProductive = Number(points) < 0 ? false : true;
    let timelineCount = 0;
    let profilePic = this.getProfilePic(profilePicName);
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
              data-testid={`home-timeline-item ${timelineCount++}`}
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
  roundNumber = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };
  getProfilePic = (profilePic) => {
    if (profilePic == undefined) {
      profilePic = "Predator";
    }
    return require("../images/emojis/" + profilePic + ".svg");
  };

  render() {
    let profilePic = this.getProfilePic(this.state.profilePic);
    let leftSide = (
      <div id="col" className="col s4">
        <img id="profile" className="circle" src={profilePic} />
      </div>
    );
    let rightSide = (
      <div className="col s8">
        <span
          data-testid="team-title"
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
                return (
                  <li key={teamMember} className="collection-item">
                    {teamMember}
                  </li>
                );
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
        <div 
          data-testid="checkin-btn"
          id="checkin" 
          className="switch right">
          <label>
            Check off
            <input
              onChange={this.handleCheckIn}
              checked={this.state.isCheckIn}
              type="checkbox"
            />
            <span className="lever"></span>
            Check in
          </label>
        </div>
      </div>
    );
    let timeline = (
      <div id="mini-timeline">
        <Timeline>
          {this.state.timelineArr.map((item) => {
            return this.createTimelineItem(
              item.animal,
              item.url,
              this.roundNumber(item.points)
            );
          })}
        </Timeline>
      </div>
    );

    return (
      <div>
        <div id="row" className="row">
          <div className="card blue-grey lighten-5">
            <div id="card-content" className="card-content black-text">
              <div id="top-row" className="row">
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
