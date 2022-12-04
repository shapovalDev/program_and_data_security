import React, { useState } from "react";
import { login } from "../../helpers";
import { containerS, inputS, buttonS } from "./styles";

export const Form = ({ publicKey }) => {
  const [eEmail, setEEmail] = useState("");
  const [ePass, setEPass] = useState("");

  const onSubmit = async () => {
    const data = await login(eEmail, ePass, publicKey);
    console.log(data.message);
  };

  return (
    <div style={containerS}>
      <input
        name="e_email"
        placeholder="Email"
        value={eEmail}
        onChange={(e) => setEEmail(e.target.value)}
        style={inputS}
      />
      <input
        name="e_pass"
        placeholder="Password"
        value={ePass}
        onChange={(e) => setEPass(e.target.value)}
        style={inputS}
      />
      <button style={buttonS} onClick={onSubmit}>
        Submit
      </button>
    </div>
  );
};
