import { io } from "socket.io-client";
import {
  addMessage,
  addPublicKey,
  addUserToCrypt,
  initCryptState,
  removeUserFromCrypt,
  resetCryptState,
  setLoader,
  setPrivateKey,
  setSecret,
  setUserId,
  setUsers,
} from "../redux/actions";
import { store } from "../redux/store";
import cryptico from "cryptico";
/* global BigInt */

class ChatService {
  init() {
    this.socket = io(process.env.REACT_APP_SOCKET_URL);

    this.socket.emit("join", { name: store.getState().user.name });

    this.socket.on("join", ({ id }) => {
      store.dispatch(setUserId(id));
      store.dispatch(addUserToCrypt(id));
    });

    this.socket.on("systemMessage", (message) => {
      if (message.users) {
        store.dispatch(setUsers(message.users));
        store.dispatch(addMessage({ ...message, type: "system" }));
      } else {
        store.dispatch(addMessage({ ...message, type: "system" }));
      }
    });

    this.socket.on("startKeyExchange", ({ p, g }) => {
      const message = { body: `p = ${p}, g = ${g}` };
      store.dispatch(addMessage({ ...message, type: "system" }));
      this._initCryptState(p, g);
    });

    this.socket.on("generateKey", () => {
      this._createPrivateKey();
      this._sendPublicKey();
    });

    this.socket.on("publicKey", ({ key, name }) => {
      const message = { body: `${name}\'s public key: ${key}` };
      store.dispatch(addMessage({ ...message, type: "system" }));
      store.dispatch(addPublicKey(BigInt(key)));
      this._getSecret(key);
    });

    this.socket.on("chatMessage", (message) => {
      //decrypt here
      console.log(store.getState().crypto.secret);
      console.log(`message.user_id`, message.user_id);
      const users = store.getState().users.usersToCrypt;
      console.log(`users[1]`, users[1]);
      let isDecrypt = message.user_id === users[1] ? true : false;
      if (store.getState().crypto.secret && isDecrypt) {
        const keyLength = 1024;
        const keys = cryptico.generateRSAKey(
          store.getState().crypto.secret,
          keyLength
        );
        const msg = cryptico.decrypt(message.body, keys).plaintext;
        store.dispatch(
          addMessage({
            uid: message.user_id,
            name: message.name,
            time: message.time,
            body: msg,
            self: false,
          })
        );
      } else {
        store.dispatch(
          addMessage({
            uid: message.user_id,
            name: message.name,
            time: message.time,
            body: message.body,
            self: false,
          })
        );
      }
    });

    this.socket.on("joinToCrypt", ({ ids }) => {
      ids.forEach((id) => {
        store.dispatch(addUserToCrypt(id));
      });
    });

    this.socket.on("removeFromCrypt", ({ ids }) => {
      const usersToCrypt = store.getState().users.usersToCrypt;
      const removeIds = usersToCrypt.map((userId) => {
        if (!ids.find((id) => id === userId)) {
          return userId;
        }
      });
      removeIds.forEach((id) => {
        store.dispatch(removeUserFromCrypt(id));
      });
      store.dispatch(resetCryptState());
    });
  }

  sendMessage(message) {
    console.log("use", store.getState().users.usersToCrypt);
    console.log("mmm", store.getState().messages);
    const uid = store.getState().user.id;
    console.log(`message`, message);
    if (store.getState().crypto.secret) {
      const keyLength = 1024;
      const keys = cryptico.generateRSAKey(
        store.getState().crypto.secret,
        keyLength
      );
      const pK = cryptico.publicKeyString(keys);
      const e_msg = cryptico.encrypt(message.body, pK).cipher;
      store.dispatch(
        addMessage({
          user_id: uid,
          name: message.name,
          time: message.time,
          body: message.body,
          self: true,
        })
      );
      this.socket.emit("chatMessage", {
        user_id: uid,
        name: message.name,
        time: message.time,
        body: e_msg,
      });
    } else {
      store.dispatch(
        addMessage({
          user_id: uid,
          name: message.name,
          time: message.time,
          body: message.body,
          self: true,
        })
      );
      this.socket.emit("chatMessage", {
        user_id: uid,
        name: message.name,
        time: message.time,
        body: message.body,
      });
    }
  }

  joinToCrypt() {
    this.socket.emit("joinToCrypt", {
      ids: store.getState().users.usersToCrypt,
    });
  }

  removeFromCrypt(user_id) {
    this.socket.emit("removeFromCrypt", {
      removeId: user_id,
      ids: store.getState().users.usersToCrypt,
    });
  }

  exchangeKey() {
    const ids = store.getState().users.usersToCrypt;
    this.socket.emit("startKeyExchange", { ids });
  }

  _initCryptState(p, g) {
    const allKeys = store.getState().users.usersToCrypt.length;
    store.dispatch(initCryptState(p, g, allKeys));
  }

  _createPrivateKey() {
    const key = Math.floor(Math.random() * 10 ** 8);
    store.dispatch(setPrivateKey(key));
  }

  _sendPublicKey() {
    store.dispatch(setLoader(true));

    const { privateKey, p, g } = store.getState().crypto;
    const key = this.modularPow(BigInt(g), BigInt(privateKey), BigInt(p));
    const name = store.getState().user.name;
    const myId = store.getState().user.id;
    const id = store
      .getState()
      .users.usersToCrypt.filter((userId) => userId !== myId)[0];

    this.socket.emit("publicKey", { key: key.toString(), name, id });
    store.dispatch(setLoader(false));
  }

  modularPow(base, pow, mod) {
    let c = BigInt(1);
    for (let i = 1; i <= pow; i++) {
      c = (c * base) % mod;
    }
    return c;
  }

  _getSecret(publicKey) {
    store.dispatch(setLoader(true));

    const { privateKey, p } = store.getState().crypto;
    console.log(`privateKey`, privateKey);
    console.log("publicKey", publicKey);
    const secret = this.modularPow(
      BigInt(publicKey),
      BigInt(privateKey),
      BigInt(p)
    );
    console.log(`secret`, secret);
    store.dispatch(setSecret(secret));
    store.dispatch(setLoader(false));
  }
}

export default new ChatService();
