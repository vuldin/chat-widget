import events, { subscribe, publish } from "../../events";
import React, { Component } from "react";
import { findDOMNode, render } from "react-dom";
import request from "superagent";
import moment from "moment";

class App extends Component {
  constructor(props) {
    super();
    this.state = {
      apps: []
    };
    const context = props.data.message.context;
    let realToday = moment();
    let realRequestedDate = moment(context.date, "YYYY-MM-DD");
    let fakeToday = moment(context.currentDate, "YYYY-MM-DD");
    this.diff = realToday.diff(realRequestedDate, "days");
    this.appName = context.apps;
    this.fakeRequestedDate = fakeToday.subtract(this.diff, "days");
  }
  setStateAsync(state) {
    return new Promise(resolve => {
      this.setState(state, resolve);
    });
  }
  async componentDidMount() {
    let cciData = await Promise.all([
      request.get("http://172.27.12.35:6001/history")
    ]);
    let apps = [];
    cciData[0].body
      .filter(day => {
        let result = false;
        if (day.time.indexOf(this.fakeRequestedDate.format("YYYYMMDD")) > -1)
          result = true;
        return result;
      })
      .forEach(day => {
        let counters = day.metrics.filter(
          metric => metric.metricId == "ibmaaf_bytestotal_by_application"
        )[0].counters;
        counters.forEach(counter => {
          let done = false;
          apps.forEach(app => {
            if (app.x == counter.breakdown) {
              app.y += counter.value[0];
              done = true;
            }
          });
          if (!done) {
            if (
              counter.breakdown.toLowerCase() === this.appName.toLowerCase()
            ) {
              apps.push({
                x: counter.breakdown,
                y: counter.value[0]
              });
            }
          }
        });
      });
    apps.forEach((app, i) => {
      app.y = Math.round(app.y * 100 + Number.EPSILON) / 100; // https://stackoverflow.com/a/41716722/2316606
      app.key = i;
    });
    await this.setStateAsync({ apps: apps });
    publish("send", { silent: true, text: "dataUsageDetail done" });
  }
  render() {
    console.log(this.state.apps);
    const app = this.state.apps[0];
    let component = <div />;
    if (this.state.apps.length > 0)
      component = (
        <div>
          <span>{`On ${this.fakeRequestedDate.format("dddd")} (${this
            .diff} days ago), the total data used by `}</span>
          <span style={{ fontWeight: "bold" }}>{app.x}</span>
          <span>{` was `}</span>
          <span style={{ fontWeight: "bold" }}>{`${app.y}MB`}</span>
          <span>{`.`}</span>
        </div>
      );
    return component;
  }
}

module.exports = {
  init: () => {
    subscribe("layout:dataUsageDetail", data => {
      data.layoutElement.className = ""; // remove class from mount element
      let myParent = data.layoutElement.parentNode;
      if (myParent.childNodes[0] != undefined)
        myParent.removeChild(myParent.childNodes[0]);
      render(<App data={data} />, data.layoutElement);
    });
  }
};
