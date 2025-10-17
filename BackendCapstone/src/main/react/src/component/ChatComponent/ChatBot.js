import styled from "styled-components";
import {useContext, useEffect, useState} from "react";
import ChattingApi from "../../api/ChattingApi";
import {useNavigate} from "react-router-dom";
import {ChatContext} from "../../context/ChatStore";

const ChattingRoomBg = styled.div`
  width: 100%;
  height: 100%;
  background: #FFF;
  padding: 0 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ChattingTitle = styled.div`
    width: 100%;
    font-size: 1.15em;
    padding: 30px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
`;

const MessagesContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100% - 148px);
    overflow-y: auto;
    padding: 10px;
    &::-webkit-scrollbar {
        width: 10px;
    }
    &::-webkit-scrollbar-thumb {
        background: #9f8fe4;
        border-radius: 10px;
    }
`;

const MessageBox = styled.div`
    align-self: ${(props) => (props.isSender ? "flex-end" : "flex-start")};
    margin: 5px 0;
`;

const Message = styled.div`
    padding: 10px;
    max-width: 70%;
    border-radius: 20px;
    background-color: ${(props) => (props.isSender ? "#ECE1FF" : "#E0E0E0")};
    border: 1px solid ${(props) => (props.isSender ? "#ECE1FF" : "#E0E0E0")};
`;

const MsgInputBox = styled.div`
    width: 100%;
    padding: 10px;
    background-color: #EEE;
    display: flex;
    justify-content: space-between;
    border-radius: 10px;
    margin-top: auto;
`;

const MsgInput = styled.textarea`
    flex: 1;
    padding: 10px;
    border: none;
    background: none;
    font-size: 1em;
    resize: none;
    outline: none;
    overflow-y: auto;
`;

const SendButton = styled.button`
    background-color: #007bff;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 10px;
`;

const ChatBot = () => {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const isAi = false
  const navigator = useNavigate();
  const {setSelectedPage, setIsMenuOpen, isMenuOpen} = useContext(ChatContext);
  
  useEffect(() => {
    if(!isAi) {
      navigator("/post/list/faq")
      setSelectedPage("chatList");
      setIsMenuOpen(!isMenuOpen);
    }
  }, []);
  
  
  const formatTime = (date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };
  
  const onClickSendChat = async () => {
    if (!message.trim()) return;
    const currentTime = new Date();
    setChat([
      ...chat,
      { message, user: true, regDate: formatTime(currentTime) },
    ]);
    const rsp = await ChattingApi.getMessage(message);
    console.log(rsp);
    setChat([...chat, { message, user: true, regDate: formatTime(currentTime) }, { ...rsp.data, regDate: formatTime(new Date()) }]);
    setMessage("");
  };
  
  return (
    <ChattingRoomBg>
      <ChattingTitle>AI 챗봇</ChattingTitle>
      <MessagesContainer>
        {chat.map((msg, index) => (
          <MessageBox key={index} isSender={msg.user}>
            <Message isSender={msg.user}>{msg.message}</Message>
            <div style={{fontSize: "0.8em", color: "#666", marginTop: "5px"}}>
              {msg.regDate}
            </div>
          </MessageBox>
        ))}
      </MessagesContainer>
      <MsgInputBox>
        <MsgInput
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <SendButton onClick={onClickSendChat}>전송</SendButton>
      </MsgInputBox>
    </ChattingRoomBg>
  );
};

export default ChatBot;

