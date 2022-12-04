import React, { useState } from "react";
import { RiSendPlaneFill } from "react-icons/ri";
import { connect } from "react-redux";
import ChatService from "../services/chat-service";

const Input = ({ name }) => {
  const [message, setMessage] = useState("");

  const changeHandler = (e) => {
    setMessage(e.target.value);
  };

  const sendByEnter = (e) => {
    if (e.key === "Enter") {
      send();
    }
  };

  const send = () => {
    if (message.trim()) {
      const msg = { name, body: message, time: Date.now() };
      ChatService.sendMessage(msg);
      setMessage("");
    }
  };

  return (
    <div className="input-wrapper">
      <div className="input-content">
        <div className="input__input">
          <input
            type="text"
            placeholder="Type a message here"
            value={message}
            onChange={changeHandler}
            onKeyPress={sendByEnter}
          />
        </div>
        <div className="input__button">
          <div className="input__button button" onClick={send}>
            <RiSendPlaneFill />
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    name: state.user.name,
  };
};

export default connect(mapStateToProps, null)(Input);
