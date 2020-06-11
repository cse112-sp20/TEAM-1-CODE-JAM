/*global chrome*/
import React, { Component } from "react";
import { Doughnut } from "react-chartjs-2";
import "./Charts.css";
export default class Charts extends Component {
  /**
   * Set teams, points, and chart data for
   * a team
   * @author : Vivian lee
   * @param {Object} props list of attributes
   */
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

  /**
   * load data from function getChartData() into this.state.chartData
   * @author: Vivian Lee
   */
  componentDidMount = async () => {
    this.getBackgroundData();
    this.getChartData();
  };

  /**
   * get the current background data and re-render the chart
   * @author: Vivian Lee
   */
  getBackgroundData() {
    // variable to hold finished parsed array for all team info
    let teamInfo = [];
    let teamData = new Map();
    // ask chrome storage for the current team
    // The api is async @ credits to Karl
    let msg = {
      for: "background",
      message: "get team points",
    };
    // ask the background for team information
    chrome.runtime.sendMessage(msg, (response) => {
      if (response[0] == undefined || response[1] == undefined) {
        return;
      }
      // parse through response that grabs the day's team and user points
      response[0].forEach((element) => {
        let newElement = Object.values(element);
        teamInfo.push(newElement);
      });
      for (let [key, value] of Object.entries(response[1])) {
        teamData[key] = value;
      }
      this.setState({
        teams: teamInfo,
        points: teamData,
      });
    });
  }

  /**
   * function to insert data into chart
   * @author : Vivian Lee
   */
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

  /**
   * Renders the chart
   * @author: Vivian Lee
   */
  render() {
    let data = [];
    let testArray = {
      labels: ["Team Points", "My Contributions"],
      data: [],
    };

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

      // New data
      const newChartData = {
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
      };

      // Append data to test array
      testArray.data.push({
        teamCode: curTeamCode,
        points: tempArray,
      });
      // if (window.name == "nodejs") continue;

      // create doughnuts based on number of teams
      data.push(
        window.name !== "nodejs" ? (
          <Doughnut
            key="2"
            data={newChartData}
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
        ) : (
          <div key={"test" + index}></div>
        )
      );
    }

    return (
      <div
        id="chart"
        data-testid="chart-container"
        chartdata={testArray}
        className="chart"
      >
        {data}
      </div>
    );
  }
}
