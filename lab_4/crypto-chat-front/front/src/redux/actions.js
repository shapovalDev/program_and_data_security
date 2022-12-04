export const ADD_MESSAGE = "ADD_MESSAGE";
export const SET_USERNAME = "SET_USERNAME";
export const SET_USER_ID = "SET_USER_ID";
export const SET_USERS = "SET_USERS";
export const ADD_USER_TO_CRYPT = "ADD_USER_TO_CRYPT";
export const REMOVE_USER_FROM_CRYPT = "REMOVE_USER_FROM_CRYPT";
export const INIT_CRYPT_STATE = "INIT_CRYPT_STATE";
export const SET_PRIVATE_KEY = "SET_PRIVATE_KEY";
export const ADD_PUBLIC_KEY = "ADD_PUBLIC_KEY";
export const SET_SECRET = "SET_SECRET";
export const RESET_CRYPT_STATE = "RESET_CRYPT_STATE";
export const SET_LOADER = "SET_LOADER";

export const addMessage = (message) => ({
  type: ADD_MESSAGE,
  message,
});

export const setUsername = (username) => ({
  type: SET_USERNAME,
  username,
});

export const setUserId = (id) => ({
  type: SET_USER_ID,
  id,
});

export const setUsers = (users) => ({
  type: SET_USERS,
  users,
});

export const addUserToCrypt = (user_id) => ({
  type: ADD_USER_TO_CRYPT,
  user_id,
});

export const removeUserFromCrypt = (user_id) => ({
  type: REMOVE_USER_FROM_CRYPT,
  user_id,
});

export const initCryptState = (p, g, allKeys) => ({
  type: INIT_CRYPT_STATE,
  payload: { p, g, allKeys },
});

export const setPrivateKey = (key) => ({
  type: SET_PRIVATE_KEY,
  key,
});

export const addPublicKey = (key) => ({
  type: ADD_PUBLIC_KEY,
  key,
});

export const setSecret = (key) => ({
  type: SET_SECRET,
  key,
});

export const resetCryptState = () => ({
  type: RESET_CRYPT_STATE,
});

export const setLoader = (loading) => ({
  type: SET_LOADER,
  loading,
});
