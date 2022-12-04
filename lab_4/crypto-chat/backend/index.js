const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const ChatService = require("./chats");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://192.168.0.138:3001",
  },
});

io.on("connection", (socket) => {
  console.log("New connection", socket.id);

  socket.on("join", ({ name }) => {
    ChatService.joinUser(socket.id, name);

    socket.emit("join", {
      id: socket.id,
    });

    socket.emit("systemMessage", {
      body: "Welcome to the Chat!",
      users: ChatService.getUsers(),
    });

    socket.broadcast.emit("systemMessage", {
      body: `${name} has joined the chat`,
      users: ChatService.getUsers(),
    });

    socket.on("disconnect", () => {
      ChatService.disconnectUser(socket.id);
      io.emit("systemMessage", {
        body: `${name} has left the chat`,
        users: ChatService.getUsers(),
      });
    });
  });

  socket.on("chatMessage", (message) => {
    console.log(`message`, message);
    socket.broadcast.emit("chatMessage", {
      user_id: message.user_id,
      name: message.name,
      body: message.body,
      time: message.time,
    });
  });

  socket.on("joinToCrypt", ({ ids }) => {
    ids.forEach((id) => {
      io.to(id).emit("joinToCrypt", { ids });
    });
  });

  socket.on("removeFromCrypt", ({ removeId, ids }) => {
    io.to(removeId).emit("removeFromCrypt", { ids: [removeId] });

    ids.forEach((id) => {
      io.to(id).emit("removeFromCrypt", { ids });
    });
  });

  socket.on("startKeyExchange", ({ ids }) => {
    io.emit("startKeyExchange", {
      p: (
        BigInt(Math.floor(Math.random() * 123 ** 3)) *
        BigInt(13) ** BigInt(7)
      ).toString(),
      g: Math.floor(Math.random() * 1234),
    });
    ids.forEach((id) => {
      io.to(id).emit("generateKey");
    });
  });

  socket.on("publicKey", ({ key, name, id }) => {
    io.to(id).emit("publicKey", {
      key,
      name,
    });
  });
});

server.listen(8080, "192.168.0.138", () => {
  console.log("Server is listening...");
});
