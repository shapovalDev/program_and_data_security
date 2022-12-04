import axios from "axios";
import cryptico from "cryptico";

export const getPublicKey = () => {
  return axios.get("http://localhost:5000/").then((resp) => resp.data.public);
};

export const login = (email, pass, publicKey) => {
  const key = publicKey;
  const e_email = cryptico.encrypt(email, key).cipher;
  const e_pass = cryptico.encrypt(pass, key).cipher;

  return axios
    .post("http://localhost:5000/login", {
      e_email,
      e_pass,
    })
    .then((response) => {
      return response.data;
    });
};
