import { Provider } from 'react-redux';
import { Chat } from './components/Chat';
import { store } from './redux/store';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Greeting } from './components/Greeting';

const App = () => {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <Switch>
          <Route
            path="/chat"
            render={() => {
              if (!store.getState().user.name) {
                return <Redirect to="/" />;
              } else {
                return <Chat />;
              }
            }}
          />

          <Route path="/">
            <Greeting />
          </Route>
        </Switch>
      </Provider>
    </BrowserRouter>
  );
};

export default App;
