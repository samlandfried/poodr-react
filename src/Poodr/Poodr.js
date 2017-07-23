import React, { Component } from "react";
import Options from "./Options/Options";
import UserInfo from "./UserInfo/UserInfo";
import Groups from "./Groups/Groups";
import Notify from "./Notify/Notify";
import { AUTH_CONFIG } from "../Auth/auth0-variables";

export default class Poodr extends Component {
  constructor() {
    super();
    this.state = {
      user: {},
      groups: [],
      channelName: null
    };
  }

  componentDidMount() {
    const body = JSON.stringify({
      client_id: AUTH_CONFIG.managementId,
      client_secret: AUTH_CONFIG.managementSecret,
      audience: "https://samlandfried.auth0.com/api/v2/",
      grant_type: "client_credentials"
    });
    const options = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body
    };

    fetch("https://samlandfried.auth0.com/oauth/token", options)
      .then(
        function(resp) {
          return resp.text();
        }.bind(this)
      )
      .then(
        function(data) {
          const parser = require("jwt-decode");
          const u_id = parser(localStorage.id_token)["sub"];
          const parsed = JSON.parse(data);

          const options = {
            method: "GET",
            headers: {
              "content-type": "application/json",
              Authorization: "Bearer " + parsed.access_token
            }
          };
          // get user profile by parsing the localStorage.id_token JWT
          return fetch(
            "https://samlandfried.auth0.com/api/v2/users/" + u_id,
            options
          );
        }.bind(this)
      )
      .then(
        function(resp) {
          return resp.json();
        }.bind(this)
      )
      .then(
        function(data) {
          this.setState({ user: data });
        }.bind(this)
      );
  }

  makeGroups(channel_id) {
    const form = document.querySelector("#grouping-options");
    const groupingStrategy = form.querySelector("#grouping-strategy-select")
      .value;
    const groupSize = form.querySelector("#group-size-select").value;
    const oddMemberStrategy = document.querySelector(
      'input[name="odd-member-strategy"]:checked'
    ).value;

    const token = this.state.user.identities[0].access_token;
    const url = 'https://slack.com/api/channels.info?token=' + token + '&channel=' + channel_id
    fetch(url)
    .then(resp => resp.json())
    .then(data => {
      const members = data.channel.members;
      this.setState({channelName: data.channel.name})
      const grooprUrl = 'https://groopr.herokuapp.com/api/v1/groups'
      const options = {
        method: 'POST',
        headers: { "content-type": "application/json" },
        body: data.channel.members
      }
      return fetch(grooprUrl, options)
    })
    .then(resp => resp.json())
    .then(data => {
      data
    });
    this.setState({ groups: [groupingStrategy, groupSize, oddMemberStrategy] });
  }

  render() {
    return (
      <div id="user-is-logged-in">
        {Object.keys(this.state.user).length > 0 &&
          <div id="user-info-loaded">
            <UserInfo user={this.state.user} />
            {this.state.groups.length === 0 &&
              <Options
                token={this.state.user.identities[0].access_token}
                makeGroups={this.makeGroups.bind(this)}
              />}
            {this.state.groups.length > 0 &&
              <div class="groups">
                <Notify user={this.state.user.name} channel={this.channelName} />
                <Groups groups={this.state.groups} />
              </div>}
          </div>}
      </div>
    );
  }
}
