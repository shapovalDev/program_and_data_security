import {
  ADD_MESSAGE,
  ADD_PUBLIC_KEY,
  ADD_USER_TO_CRYPT,
  INIT_CRYPT_STATE,
  REMOVE_USER_FROM_CRYPT,
  RESET_CRYPT_STATE,
  SET_LOADER,
  SET_PRIVATE_KEY,
  SET_SECRET,
  SET_USERNAME,
  SET_USERS,
  SET_USER_ID,
} from "./actions";

const messagesState = {
  messages: [],
};

const userState = {
  name: "",
  id: undefined,
  loading: false,
};

const usersState = {
  users: [],
  usersToCrypt: [],
};

const cryptState = {
  privateKey: null,
  publicKeys: [],
  p: null,
  g: null,
  needPublicKeys: [],
  secret: null,
};

export const MessagesReducer = (state = messagesState, action) => {
  switch (action.type) {
    case ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.message] };
    default:
      return state;
  }
};

export const UserReducer = (state = userState, action) => {
  switch (action.type) {
    case SET_USERNAME:
      return { ...state, name: action.username };
    case SET_USER_ID:
      return { ...state, id: action.id };
    case SET_LOADER:
      return { ...state, loading: action.loading };
    default:
      return state;
  }
};

export const UsersReducer = (state = usersState, action) => {
  switch (action.type) {
    case SET_USERS:
      return { ...state, users: action.users.sort((a, b) => a.id > b.id) };
    case ADD_USER_TO_CRYPT: {
      const newUsersToCrypt = [...state.usersToCrypt];
      if (
        !newUsersToCrypt.filter((userId) => userId === action.user_id).length
      ) {
        newUsersToCrypt.push(action.user_id);
      }
      return {
        ...state,
        usersToCrypt: newUsersToCrypt.sort((a, b) => a.id > b.id),
      };
    }

    case REMOVE_USER_FROM_CRYPT: {
      const newUsersToCrypt = state.usersToCrypt.filter(
        (user_id) => user_id !== action.user_id
      );
      return {
        ...state,
        usersToCrypt: newUsersToCrypt.sort((a, b) => a.id > b.id),
      };
    }

    default:
      return state;
  }
};

export const CryptReducer = (state = cryptState, action) => {
  switch (action.type) {
    case INIT_CRYPT_STATE:
      return {
        ...state,
        p: action.payload.p,
        g: action.payload.g,
        needPublicKeys: action.payload.allKeys - 1,
      };

    case SET_PRIVATE_KEY:
      return { ...state, privateKey: action.key };

    case ADD_PUBLIC_KEY: {
      let publicKeys = [...state.publicKeys];
      publicKeys.push(action.key);
      return { ...state, publicKeys };
    }

    case SET_SECRET:
      return { ...state, secret: action.key };

    case RESET_CRYPT_STATE:
      return cryptState;

    default:
      return state;
  }
};
