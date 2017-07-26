import React, { Component } from "react";
import Options from "./Options/Options";
import Groups from "./Groups/Groups";
import Notify from "./Notify/Notify";
import history from "./../history";

export default class Poodr extends Component {
  constructor() {
    super();
    this.state = {
      user: {},
      groups: [],
      channelName: null
    };
  }

  render() {
    return (
      <div id={"poodr"}>
        {this.state.groups.length === 0 &&
          <div className={"options"}>
            <Options
              token={this.props.bot.bot_access_token}
              makeGroups={this.makeGroups.bind(this)}
            />
          </div>}
        {this.state.groups.length > 0 &&
          <div className="notify-and-groups">
            <Notify
              user={this.props.user.name}
              channel={this.state.channelName}
              messagePeeps={this.messagePeeps.bind(this)}
              clearGroups={this.clearGroups.bind(this)}
            />{" "}
            <Groups
              token={this.props.bot.bot_access_token}
              groups={this.state.groups}
              dragStartHandler={this.dragStartHandler.bind(this)}
              dropHandler={this.dropHandler.bind(this)}
            />{" "}
          </div>}{" "}
      </div>
    );
  }

  dragStartHandler(event) {
    const img = event.currentTarget.querySelector("img");
    const dataToSend = {
      u_id: event.currentTarget.dataset.u_id,
      fromGroup: event.currentTarget.dataset.group_id
    };
    event.dataTransfer.setDragImage(img, 45, 45);
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setData("text", JSON.stringify(dataToSend));
  }

  dropHandler(event) {
    event.preventDefault();
    const toGroup = event.currentTarget.dataset.group_id;
    const data = event.dataTransfer.getData("text");
    const dropped = JSON.parse(data);
    const groups = this.state.groups;
    removeUserFromGroup(dropped.u_id, groups[dropped.fromGroup]);
    groups[toGroup].push(dropped.u_id);
    this.setState({ groups: groups });
  }

  clearGroups() {
    this.setState({ groups: [] });
  }

  makeGroups(channel_id) {
    const form = document.querySelector("#grouping-options");
    const groupingStrategy = form.querySelector("#grouping-strategy-select")
      .value;
    const groupSize = form.querySelector("#group-size-select").value;
    const oddMemberStrategy = document.querySelector(
      'input[name="odd-member-strategy"]:checked'
    ).value;
    const options = {
      size: groupSize,
      oddMemberStrategy: oddMemberStrategy,
      groupingStrategy: groupingStrategy
    };

    const token = this.props.bot.bot_access_token;
    const url =
      "https://slack.com/api/channels.info?token=" +
      token +
      "&channel=" +
      channel_id;

    fetch(url)
      .then(
        function(resp) {
          return resp.json();
        }.bind(this)
      )
      .then(
        function(data) {
          const members = data.channel.members;
          this.setState({ channelName: data.channel.name });
          const grooprUrl = "http://groopr.herokuapp.com/api/v1/groups";

          const body = {
            method: "POST",
            headers: new Headers({ "Content-Type": "application/json" }),
            body: JSON.stringify({ collection: members, options: options })
          };

          fetch(grooprUrl, body)
            .then(
              function(resp) {
                return resp.json();
              }.bind(this)
            )
            .then(data => {
              this.setState({
                groups: data.groups
              });
            })
            .catch(error => console.error(error));
        }.bind(this)
      );
  }

  messagePeeps(event) {
    event.preventDefault();
    const message = document.querySelector("form textarea").value;
    const skipHistory = document.querySelector('form input[type="checkbox"]')
      .checked;
    const token = this.props.bot.bot_access_token;
    const groups = this.state.groups;

    // When it's just one user, this needs to be a DM w/ the bot. Different endpoint for DMs
    const url = `https://slack.com/api/mpim.open?token=${token}&users=`;
    groups.forEach(group => {
      const users = group.join(",");

      fetch(url + users).then(resp => resp.json()).then(data => {
        if (data.ok) {
          const g_id = data.group.id;
          const dmUrl = `https://slack.com/api/chat.postMessage?token=${token}&channel=${g_id}&text=${message}&pretty=1`;
          fetch(dmUrl).then(resp => resp.json()).then(data => {
            if (data.ok) {
              this.clearGroups();
            } else {
              console.error(data.error);
            }
          });
        } else {
          console.error(data.error);
        }
      });
    });
  }
}

const removeUserFromGroup = (user, group) => {
  const i = group.indexOf(user);
  return group.splice(i, 1);
};
