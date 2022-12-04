import { combineReducers, createStore } from "redux";
import {
  CryptReducer,
  MessagesReducer,
  UserReducer,
  UsersReducer,
} from "./reducer";

const rootReducer = combineReducers({
  messages: MessagesReducer,
  user: UserReducer,
  users: UsersReducer,
  crypto: CryptReducer,
});

export const store = createStore(rootReducer);
