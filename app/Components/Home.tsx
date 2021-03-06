import React from 'react';
import ChooseChannel from './ChooseChannel';
import Card from '../Patterns/Card';
import ChatQueue from './ChatQueue';
import SlackService from '../Services/SlackService';
import WebSocketComponent from '../Features/WebSocket';
import { ModalConsumer } from '../Patterns/Modal';
import RegisterModal from './Modals/RegisterModal';
import ResetModal from './Modals/ResetModal';

interface HomeProps {
  history?: any;
}

interface HomeState {
  users: SlackUser[];
}

class Home extends React.Component<HomeProps, HomeState> {
  private slackService: SlackService;

  constructor(props: HomeProps) {
    super(props);
    this.slackService = new SlackService();
    this.state = {
      users: [],
    };
  }

  componentDidMount() {
    this.fetchUsers();
  }

  private fetchUsers() {
    return this.slackService.getUsers().then((u) => {
      if (u) {
        return this.setState({
          users: u,
        });
      }
      throw new Error('No users');
    });
  }

  private handleWebsocketMessage(event: SlackEvent) {
    if (event?.type === 'user_change') {
      this.fetchUsers();
    }
  }

  render() {
    const { users } = this.state;
    const { history } = this.props;
    return (
      <ModalConsumer>
        {(context) => {
          return (
            <WebSocketComponent
              url="localhost:5003"
              onMessage={(e) => {
                if (typeof e.data === 'string') {
                  const event: SlackEvent = JSON.parse(e.data);
                  this.handleWebsocketMessage(event);
                }
              }}
            >
              {() => (
                <div className="container">
                  <Card header="Streaming Reaction Overlay" className="mt-3">
                    <ChooseChannel />
                  </Card>
                  {/* <Card
                    header="Find others in the company who are looking for conversation partners"
                    className="my-3"
                  >
                    <ChatQueue users={users} />
                  </Card> */}
                  <Card header="Re-register your slackbot tokens.">
                    <button
                      type="button"
                      className="btn btn-info mr-2"
                      onClick={() => {
                        context.openModal(<RegisterModal />);
                      }}
                    >
                      Re-register
                    </button>
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={() => {
                        context.openModal(
                          <ResetModal
                            onReset={() => {
                              history.push('/register');
                            }}
                          />
                        );
                      }}
                    >
                      Reset
                    </button>
                  </Card>
                </div>
              )}
            </WebSocketComponent>
          );
        }}
      </ModalConsumer>
    );
  }
}

export default Home;
