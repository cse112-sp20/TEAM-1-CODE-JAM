/*global chrome*/
import React, { Component } from "react";
import { Doughnut } from "react-chartjs-2";
import "./Charts.css";
export default class Charts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // data grabbed from background url
      /* format: 2d array
      [
        ["code1", "teamname1", timejoined],
        ["code2", "teamname2", timejoined],
         ...
      ]
      */
      teams: [],
      points: "",
      chartData: "",
    };
  }
  // load data from function getChartData() into this.state.chartData
  componentDidMount = async () => {
    this.getBackgroundData();
    this.getChartData();
  };
  getBackgroundData() {
    // variable to hold finished parsed array for all team info
    let teamInfo = [];
    let teamData = new Map();
    // ask chrome storage for the current team
    // The api is async @ credits to Karl
    let msg = {
      for: "background",
      message: "get teams",
    };
    // ask the background for team information
    chrome.runtime.sendMessage(msg, (response) => {
      if (response == undefined) {
        return;
      }
      console.log(response);
      // parse through response that grabs the day's team and user points
      response.forEach((element) => {
        let newElement = Object.values(element);
        teamInfo.push(newElement);
      });
      this.setState({
        teams: teamInfo,
      });
    });
    let msg2 = {
      for: "background",
      message: "get team points",
    };
    // ask the background for team information
    chrome.runtime.sendMessage(msg2, (response) => {
      if (response == undefined) {
        return;
      }
      for (let [key, value] of Object.entries(response)) {
        teamData[key] = value;
      }
      this.setState({
        points: teamData,
      });
    });
  }
  // function to insert data into chart
  getChartData() {
    this.setState({
      // replace object in chartData with Firebase data
      chartData: {
        labels: ["My Contributions", "Team Contributions"],
        datasets: [
          {
            type: "doughnut",
            label: "My Contributions",
            data: [10, 20],
            backgroundColor: [
              "rgba(11, 113, 126, 0.7)",
              "rgba(255,206,86,0.6)",
            ],
          },
        ],
      },
    });
  }
  render() {
    let data = [];
    if (window.name !== "nodejs") {
      let index;
      // iterate through each team
      for (index = 0; index < this.state.teams.length; index++) {
        // grab team code
        let curTeamCode = this.state.teams[index][0];
        // grab points associated to person and team
        let pointsPair = this.state.points[curTeamCode];
        // get out of something is undefined ( a deleted team )
        if (pointsPair == undefined) {
          break;
        }
        // create array for graphing
        let tempArray = [];
        pointsPair = Object.entries(pointsPair);
        tempArray.push(pointsPair[0][1]);
        tempArray.push(pointsPair[1][1]);

        // create doughnuts based on number of teams
        data.push(
          <Doughnut
            key="2"
            data={{
              labels: ["Team Points", "My Contributions"],
              datasets: [
                {
                  type: "doughnut",
                  label: "My Contributions",
                  data: tempArray,
                  backgroundColor: [
                    "rgba(11, 113, 126, 0.7)",
                    "rgba(255,206,86,0.6)",
                  ],
                },
              ],
            }}
            options={{
              title: {
                display: true,
                text: this.state.teams[index][1],
                fontSize: 20,
              },
              legend: {
                display: true,
                position: "bottom",
              },
              maintainAspectRatio: true,
            }}
          />
        );
      }
      return (
        <div id="chart" chartData={this.state.chartData} className="chart">
          {data}
        </div>
      );
    }
  }
}
