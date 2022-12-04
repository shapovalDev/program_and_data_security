import React, { useState } from "react";
import { useHistory } from "react-router";
import { setUsername } from "../redux/actions";
import { store } from "../redux/store";
import "./style.css";

export const Greeting = () => {
  const history = useHistory();
  const [name, setName] = useState("");

  const changeHandler = (e) => {
    setName(e.target.value);
  };

  const goChatByEnter = (e) => {
    if (e.key === "Enter") {
      goChat();
    }
  };

  const goChat = () => {
    if (name.trim()) {
      store.dispatch(setUsername(name));
      history.push("/chat");
    }
  };
  return (
    <div className="greeting-wrapper">
      <div className="greeting-content">
        <div className="greeting-body">
          <div className="greeting-body__heading">
            <p style={{ color: "#fff" }}>Welcome to the CryptoChat!</p>
          </div>
          <div className="greeting-body__main">
            <input
              type="text"
              value={name}
              onChange={changeHandler}
              onKeyPress={goChatByEnter}
              placeholder="Your name is..."
              autoFocus
            />
            <button onClick={goChat}>GO!</button>
          </div>
        </div>
      </div>
    </div>
  );
};
