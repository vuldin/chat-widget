import events, { subscribe, publish } from "../../events";
import React, { Component } from "react";
import { findDOMNode, render } from "react-dom";
import request from "superagent";
import { VictoryPie, VictoryLabel } from "victory";
import Table from "rc-table";

class App extends Component {
  state = {
    apps: [],
    columns: [
      { title: "Application", dataIndex: "x", key: "app", width: 200 },
      { title: "Usage (in MB)", dataIndex: "y", key: "value", width: 150 }
    ]
  };
  setStateAsync(state) {
    return new Promise(resolve => {
      this.setState(state, resolve);
      let div = findDOMNode(this.refs.table);
      let spans = div.querySelectorAll("span");
      spans.forEach(span => (span.style.margin = "5px"));
    });
  }
  async componentDidMount() {
    let div = findDOMNode(this.refs.table);
    let tbody = div.querySelector("tbody");
    tbody.style.background = "darkslategrey";
    let cciData = await Promise.all([
      request.get("http://172.27.12.35:6001/history")
    ]);
    let apps = [];
    cciData[0].body.forEach(day => {
      let counters = day.metrics.filter(
        metric => metric.metricId == "ibmaaf_bytestotal_by_application"
      )[0].counters;
      //let counters = day.metrics.filter( metric => metric.metricId == 'ibmaaf_bytestotal_by_cell_sitename')[0].counters
      counters.forEach(counter => {
        let done = false;
        apps.forEach(app => {
          if (app.x == counter.breakdown) {
            app.y += counter.value[0];
            done = true;
          }
        });
        if (!done)
          apps.push({
            x: counter.breakdown,
            y: counter.value[0]
          });
      });
    });
    apps.forEach((app, i) => {
      app.y = Math.round(app.y * 100 + Number.EPSILON) / 100; // https://stackoverflow.com/a/41716722/2316606
      app.key = i;
    });
    await this.setStateAsync({ apps: apps });
    publish("send", { silent: true, text: "piechart done" });
  }
  componentWillUnmount() {
    // TODO
  }
  getBodyWrapper(body) {
    console.log("getBodyWrapper");
  }
  render() {
    return (
      <div
        className="IBMChat-watson-message IBMChat-watson-message-theme"
        style={{ display: "flex", flexFlow: "column" }}
      >
        <div style={{ display: "flex" }}>
          {/*
          animate={{duration: 3000}}
          width={250}
          height={250}
          style={{labels: {fill: 'white'}}}
          width={200}
          height={200}
          labelComponent={<VictoryLabel
            style={{
              fontSize: '3px',
              fill: 'white',
            }}
          />}
        */}
          <div style={{ width: "475px" }}>
            <VictoryPie
              data={this.state.apps}
              padding={{ left: 80, right: 80 }}
              colorScale={"qualitative"}
              style={{ labels: { fill: "white" } }}
              labelRadius={115}
              labelComponent={
                <VictoryLabel
                  style={{
                    fontSize: "16px",
                    fill: "white"
                  }}
                />
              }
              innerRadius={50}
              events={[
                {
                  target: "labels",
                  eventHandlers: {
                    onClick: (evt, obj) => {
                      console.log(obj);
                    }
                  }
                }
              ]}
            />
          </div>
          <Table
            ref="table"
            style={{
              display: "flex",
              alignItems: "center"
            }}
            columns={this.state.columns}
            data={this.state.apps}
          />
          {/*
          getBodyWrapper={this.getBodyWrapper}
        */}
        </div>
        <div>
          <span>{`Your most used application is `}</span>
          <span style={{ fontWeight: "bold" }}>{`Instagram`}</span>
          <span>{`, which has used around ${Number.parseInt(
            2755.54 / 1024
          )}GB (${Number.parseInt(
            2755.54 / 10240 * 100
          )}%) out of your allotted 10GB per billing cycle.`}</span>
        </div>
      </div>
    );
  }
}

module.exports = {
  init: () => {
    subscribe("layout:dataPieChart", data => {
      data.layoutElement.className = ""; // remove class from mount element
      let myParent = data.layoutElement.parentNode;
      //console.log(myParent.childNodes[0]) // TODO pull data from current child and pass to component?
      if (myParent.childNodes[0] != undefined)
        myParent.removeChild(myParent.childNodes[0]);
      render(<App message={data.message} />, data.layoutElement);
    });
  }
};
