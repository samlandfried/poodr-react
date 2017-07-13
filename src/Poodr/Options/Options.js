import React, { Component } from 'react';

export default class Options extends Component {
  render() {
    return (
      <form id="grouping-options">
        <div id="grouping-strategy">
          <h2>Grouping Strategy</h2>
          <select id="grouping-strategy-select" >
            <option value="recommended">Recommended</option>
            <option value="random">Random</option>
          </select>
        </div>
        <div id="group-size">
          <h2>Group Size</h2>
          <select id="group-size-select">
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
          </select>
        </div>
        <div id="odd-member-strategy">
          <h2>Odd Member Strategy</h2>
          <input type="radio" name="odd-member-strategy" value="bigger" checked="checked" /> Bigger groups <br />
          <input type="radio" name="odd-member-strategy" value="smaller" /> Smaller groups <br />
        </div>
        <div id="channel-search">
          <h2>Choose a Channel or Group</h2>
          <input type="text" id="channel-search-input" />
          <table id="channels" />
            <thead>
              <tr>
                <th>Channel Name</th>
              </tr>
            </thead>
          <table id="groups" />
            <thead>
              <tr>
                <th>Group Name</th>
              </tr>
            </thead>
        </div>
      </form>
    );
  }
}