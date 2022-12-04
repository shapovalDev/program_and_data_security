import React from "react";
import { connect } from "react-redux";
import {
  addUserToCrypt,
  removeUserFromCrypt,
  resetCryptState,
} from "../redux/actions";
import { store } from "../redux/store";
import {
  RiCheckboxCircleLine,
  RiCheckboxBlankCircleLine,
} from "react-icons/ri";
import ChatService from "../services/chat-service";

const Topbar = ({ users, userIdsToCrypt, currentUserId, secret }) => {
  const toggleUserCrypt = (user_id) => {
    if (user_id !== currentUserId) {
      const inUsers = !!userIdsToCrypt.filter((id) => id === user_id).length;
      if (!inUsers) {
        store.dispatch(addUserToCrypt(user_id));
        ChatService.joinToCrypt();
      } else {
        store.dispatch(removeUserFromCrypt(user_id));
        ChatService.removeFromCrypt(user_id);
      }
    }
  };

  const startExchange = () => {
    if (userIdsToCrypt.length === 2) {
      ChatService.exchangeKey();
    }
  };

  const resetKey = () => {
    store.dispatch(resetCryptState());
  };

  return (
    <div className="topbar-wrapper">
      <div className="topbar-content">
        <div className="users-wrapper">
          {users.map((user) => {
            const selected = !!userIdsToCrypt.filter(
              (id) => id === user.user_id
            ).length;
            return (
              <User
                name={user.name}
                id={user.user_id}
                isSelected={selected}
                selectUser={toggleUserCrypt}
              />
            );
          })}
        </div>
        <div className="desc">Select users to start key exchange (max 2)</div>
      </div>
      <div className="key">{secret && `KEY: ${parseInt(secret)}`}</div>
      <div className="exchange-button-wrapper">
        <div
          className="exchange-button"
          onClick={secret ? resetKey : startExchange}
        >
          {secret ? "RESET KEY" : "START KEY EXCHANGE"}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  users: state.users.users,
  userIdsToCrypt: state.users.usersToCrypt,
  currentUserId: state.user.id,
  secret: state.crypto.secret,
});

export default connect(mapStateToProps)(Topbar);

const User = ({ name, isSelected, id, selectUser }) => {
  const clickHandler = () => {
    selectUser(id);
  };
  return (
    <div className="user-content" onClick={clickHandler}>
      <div className="user-checkbox">
        {isSelected ? <RiCheckboxCircleLine /> : <RiCheckboxBlankCircleLine />}
      </div>
      <div key={id} className="user-name">
        {name}
      </div>
    </div>
  );
};
