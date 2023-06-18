import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faUser,
  faRobot,
  faFeatherAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./App.css";
import "./normalize.css";

function App() {
  /*
  Modify according to what you want
  */
  const userName = "Isaiah";
  const aiName = "AI Assistant";

  const [switchClicked, setSwitchClicked] = useState(false);
  const [image, setImage] = useState(null);
  const [input, setInput] = useState("");
  const [micClicked, setMicClicked] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [imageVisible, setImageVisible] = useState(true);

  async function handleInput(e) {
  e.preventDefault();
  const updatedChatLog = [...chatLog, { user: "chatUser", message: input }];
  setChatLog(updatedChatLog);
  setInput("");

  const response = await fetch("http://localhost:3080/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: updatedChatLog.map((message) => message.message).join(" "),
      aiName: aiName,
      userName: userName,
    }),
  });
  const data = await response.json();
  setChatLog([...updatedChatLog, { user: "chatBot", message: data.message }]);

  const emojis = ["😭", "😁", "😐", "😍", "😡", "🤮"];
  const emojiInMessage = emojis.find((emoji) => data.message.includes(emoji));

  if (emojiInMessage) {
    if (!switchClicked) {
      try {
        const imageResponse = await fetch("http://localhost:3080/images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emoji: emojiInMessage }),
        });
        const imageData = await imageResponse.json();
        console.log(imageData);
        setImage(imageData[0]?.url || null);
      } catch (error) {
        console.error(error);
      }
    } else {
      setImage(null); 
    }
  } else {
    setImage(null);
    if (
      !data.message.includes("😭") &&
      !data.message.includes("😁") &&
      !data.message.includes("😍") &&
      !data.message.includes("😡") &&
      !data.message.includes("🤮")
    ) {
      const response = await fetch("http://localhost:3080/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji: data.message }),
      });
      const imageData = await response.json();
      console.log(imageData);
      setImage(imageData[0]?.url || null);
    }
  }
}


  const getImage = async () => {
    try {
      const options = {
        method: "POST",
        body: JSON.stringify({
          message: "",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await fetch("http://localhost:3080/images", options);
      const data = await response.json();
      console.log(data);
      setImage(data[0]?.url || null);
    } catch (error) {
      console.error(error);
    }
  };

  function clearChat() {
    setChatLog([]);
  }

  function handleClickMic() {
    setMicClicked((prevState) => !prevState);
  }

  function toggleSwitch() {
    setSwitchClicked((prevState) => !prevState);
    setImageVisible((prevState) => !prevState);
  }

  return (
    <div className="App">
      <section className="mainArea">
        <div className="toggle-switch-container">
          <FontAwesomeIcon
            className={`icon-switch ${switchClicked ? "clicked" : ""}`}
            onClick={toggleSwitch}
            icon={faFeatherAlt}
          />
        </div>
        <div className="ai-image-container">
          {imageVisible && image && <img src={image} alt="ai-image" />}
        </div>
        <div className="input-container">
          <form className="input-form" onSubmit={handleInput}>
            <input
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input-text"
              type="text"
            />
          </form>
          <div
            className={`mic-box ${micClicked ? "clicked" : ""}`}
            onClick={handleClickMic}
          >
            <FontAwesomeIcon className="mic" icon={faMicrophone} />
          </div>
        </div>
      </section>
      <aside className="chatArea">
        <div className="chatLog">
          {chatLog.map((message, index) => (
            <div
              key={index}
              className={message.user === "chatBot" ? "chatBot" : "chatUser"}
            >
              <div className="profile-picture-container">
                {message.user === "chatUser" && (
                  <FontAwesomeIcon className="profile-picture" icon={faUser} />
                )}
                {message.user === "chatBot" && (
                  <FontAwesomeIcon
                    className="profile-picture"
                    icon={faRobot}
                  />
                )}
              </div>
              <div className="message-container"> {message.message}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default App;