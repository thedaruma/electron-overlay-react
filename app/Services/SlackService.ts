import axios from 'axios';
import { serverUrl } from '../Constants';

axios.defaults.adapter = require('axios/lib/adapters/http');

/**
 * Class that talks to the slack controller on the server
 */
export default class SlackService {
  private endPoint = `${serverUrl}/api`;

  async getChannels() {
    const channels = this.endPoint
      ? await axios.get(`${this.endPoint}/slack/channels`)
      : null;
    return channels?.data;
  }

  /**
   * Get list of users associated with Slack workspace.
   */
  async getUsers() {
    const response = this.endPoint
      ? await axios.get(`${this.endPoint}/slack/users`)
      : null;
    const data = await response?.data;
    return data?.members;
  }

  /**
   * Returns an array of custom workspace emojis (in the form of gifs/pngs)
   */
  async getEmojis() {
    const response = this.endPoint
      ? await axios.get(`${this.endPoint}/slack/emoji`)
      : null;
    const data = await response?.data;
    return data?.emoji;
  }

  /**
   * Get data for the channel via its name.
   * @param channelName Name of the channel as it appears in your channel-list in Slack
   */
  async getChannel(channelName: string) {
    const channel = this.endPoint
      ? await axios.get(
          `${this.endPoint}/slack/channels/channel/${channelName}`
        )
      : null;
    const data = await channel?.data;
    return data?.channel;
  }

  async getTeamInfo(): Promise<SlackInfo> {
    const channel = this.endPoint
      ? await axios.get(`${this.endPoint}/slack/channels/data`)
      : null;
    const data = await channel?.data;
    return data;
  }

  /**
   * Confirms whether the user has registered valid
   * tokens with the application yet.
   */
  async hasValidTokens() {
    const valid = this.endPoint
      ? await axios.get(`${this.endPoint}/slack/has-valid-tokens`)
      : null;
    const data = await valid?.data;

    return Boolean(data);
  }

  /**
   * Sets Slack access tokens so that the server can establish a connection with a Legacy Slack App. These tokens can be found here:
   * `https://api.slack.com/apps/{slack-app-id}/oauth?`
   * once you've created your Legacy Slack App.
   * @param botToken The bot token associated with your Legacy Slack App, will start with a 'xoxb'
   * @param userToken The user token associated with your Legacy Slack App, will start with a 'xoxp'
   */
  async setTokens(botToken: string | null, userToken: string | null) {
    const response = this.endPoint
      ? await axios.post(`${this.endPoint}/slack/local-credentials`, {
          slackUserToken: userToken,
          slackbotToken: botToken,
        })
      : null;
    const data = await response?.data;
    return Boolean(data?.success);
  }
}
