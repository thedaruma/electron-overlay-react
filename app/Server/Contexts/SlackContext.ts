import { WebClient } from '@slack/web-api';
import { app } from 'electron';
import fs from 'fs';
import { localSlackURL } from '../../Constants';
import mkdirp from 'mkdirp';

interface LocalSlackTokens {
  SLACK_BOT_USER_OAUTH_TOKEN?: string;
  SLACK_USER_OAUTH_TOKEN?: string;
}

export const fileExists = (url: string) => {
  return new Promise((resolve) => {
    fs.readFile(url, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

export const createSlackDataFile = (): Promise<LocalSlackTokens> => {
  return new Promise(async (resolve, reject) => {
    const data = {
      SLACK_BOT_USER_OAUTH_TOKEN: undefined,
      SLACK_USER_OAUTH_TOKEN: undefined,
    };
    await mkdirp(app?.getPath('userData'));
    fs.writeFile(localSlackURL(), JSON.stringify(data), function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

export const getLocalSlackData = (): Promise<LocalSlackTokens> => {
  return new Promise((resolve, reject) => {
    fs.readFile(localSlackURL(), 'utf8', async (err, data) => {
      if (err) {
        let credentials;
        try {
          credentials = await createSlackDataFile();
        } catch (err) {
          reject(err);
        }
        resolve(credentials);
      } else {
        const d = JSON.parse(data);
        resolve(d);
      }
    });
  });
};

export default class SlackContext {
  async initialize() {
    const localDataExists = await fileExists(localSlackURL());
    if (!localDataExists) {
      await createSlackDataFile();
    }
  }
  async buildWebClient() {
    const d = await getLocalSlackData();
    if (d?.SLACK_USER_OAUTH_TOKEN) {
      const webClient = new WebClient(d?.SLACK_USER_OAUTH_TOKEN);
      return webClient;
    }
    return null;
  }

  async getSlackTeamData() {
    const webClient = await this.buildWebClient();
    return webClient?.team;
  }

  async getUsers() {
    const webClient = await this.buildWebClient();
    const users = await webClient?.users?.list();
    return users;
  }
  async getChannels() {
    const webClient = await this.buildWebClient();
    const channels = await webClient?.conversations?.list();
    return channels;
  }
  async getCustomEmojis() {
    const webClient = await this.buildWebClient();
    const emojis = await webClient?.emoji?.list();
    return emojis;
  }

  private async setLocalData(value: string, property: string) {
    return new Promise(async (resolve, _reject) => {
      fs.readFile(localSlackURL(), 'utf8', async (err, data) => {
        if (err) {
          await createSlackDataFile();
          this.setLocalData(value, property);
        } else {
          const jsonData = JSON.parse(data);
          jsonData[property] = value;
          fs.writeFile(localSlackURL(), JSON.stringify(jsonData), null, () => {
            resolve();
          });
        }
      });
    });
  }

  async getSlackBotUserOauthToken() {
    const localData = await getLocalSlackData();
    return localData?.SLACK_BOT_USER_OAUTH_TOKEN;
  }

  async setSlackBotUserOauthToken(value: string) {
    return this.setLocalData(value, 'SLACK_BOT_USER_OAUTH_TOKEN');
  }

  async getSlackUserOauthToken() {
    const localData = await getLocalSlackData();
    return localData?.SLACK_USER_OAUTH_TOKEN;
  }

  async setSlackUserOauthToken(value: string) {
    return this.setLocalData(value, 'SLACK_USER_OAUTH_TOKEN');
  }

  async hasValidTokens() {
    const webClient = await this.buildWebClient();
    if (webClient) {
      const results = await webClient?.auth.test();
      return Boolean(results?.ok);
    } else {
      return false;
    }
  }
}