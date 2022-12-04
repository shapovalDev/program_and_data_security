import React, { useRef, useEffect } from "react";
import { connect } from "react-redux";

const ChatList = ({ messages }) => {
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div className="chatlist-wrapper">
      <div className="chatlist" onLoad={() => {}}>
        {messages.map((msg, index) => {
          if (msg.type) {
            return <SystemMessage body={msg.body} index={index} />;
          } else {
            return (
              <Message
                self={msg.self}
                body={msg.body}
                name={msg.name}
                time={msg.time}
                index={index}
              />
            );
          }
        })}
        <div ref={bottomRef}></div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    messages: state.messages.messages,
  };
};

export default connect(mapStateToProps, null)(ChatList);

const Message = ({ body, name, time, self, index }) => {
  return (
    <div
      className="message-place"
      style={{ alignItems: self ? "flex-end" : "flex-start" }}
      key={index}
    >
      <div className={`message-bubble ${self ? "self" : ""}`}>
        {!self && <div className="message-bubble__name">{name}</div>}
        <div className="message-bubble__body">{body}</div>
      </div>
      <div className="message-bubble__time">{getTime(time)}</div>
    </div>
  );
};

const SystemMessage = ({ body, index }) => {
  return (
    <div className="system-message-wrapper" key={index}>
      <div className="system-message-bubble">{body}</div>
    </div>
  );
};

const getTime = (timestamp) => {
  const dt = new Date(timestamp);
  return dt.toLocaleString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
