import styled from "styled-components";
import React, { useContext, useEffect, useState } from "react";
import AxiosApi from "../../api/AxiosApi";
import { Link } from "react-router-dom";
import { useNavigate, Outlet } from "react-router-dom";
import ChatMenuBar from "../../component/ChatComponent/ChatMenuBar";
import ChatList from "../../component/ChatComponent/ChatList";
import OpenChatSearch from "../../component/ChatComponent/OpenChatSearch";
import ChatBot from "../../component/ChatComponent/ChatBot";
import Chatting from "../../component/ChatComponent/Chatting";
import ChatRoomCreate from "../../component/ChatComponent/ChatRoomCreate";
import ChatStore, { ChatContext } from "../../context/ChatStore";
import Commons from "../../util/Common";
import RejectModal from "../../component/Modal/RejectModal";
import ConfirmModal from "../../component/Modal/ConfirmModal";
import {setLoginModalOpen} from "../../context/redux/ModalReducer";
import {useDispatch} from "react-redux";
import Footer from "../../styles/Footer";

const defaultBackgroundColor = "#9aa06";
const sideMenuBackgroundColor = "#eee";
// const topbarHeight = "54px";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    width: 100%;
    margin: auto;
    position: relative;
    background-color: ${props => props.color || defaultBackgroundColor};
    .footer {
        text-align: center;
    }
`;
const ChatIconBox = styled.div`
    position: fixed;
    cursor: pointer;
    z-index: 990;
    bottom: 30px;
    right: 30px;
    height: 65px;
    @media (max-width: 768px) {
        bottom: 15px;
        right: 15px;
        height: 50px;
    }
`
const ChatIcon = styled.img`
    width: 65px;
    @media (max-width: 768px) {
        width: 50px;
    }
`
const SelectPage = styled.div`
    width: 100%;
    height: calc(100% - 50px);
    flex: 1;
    overflow-y: auto;
`
export const UserContainer = styled.div`
    display: flex;
    margin: 40px 20px;
`;
export const UserAndName = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: start;
    margin: 2px 10px;
    line-height: 1.5;
`;
export const StyledSideMenu = styled.div`
    position: fixed;
    right: 30px;
    bottom: 60px;
    width: 400px;
    min-width: 340px;
    //height: 700px;
    aspect-ratio: 4 / 7;
    background-color: #FFF;
    border-radius: 30px;
    box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.5);
    z-index: ${props => props.isOpen ? "-999" : "999"};
    transform: ${props => props.isOpen ? "translateY(0)" : "translateY(-10%)"};
    opacity: ${props => props.isOpen ? "0" : "1"};
    transition: 0.5s ease;
    overflow: hidden;
    @media (max-height: 950px) {
        height: calc(100dvh - 30dvh);
        max-height: 800px;
    }
    @media (max-width: 768px) {
        right: 15px;
        bottom: 30px;
        width: 50%;
        height: calc(100dvh - 190px);
        max-height: 800px;
        transform: ${props => props.isOpen ? "translate(0, 0)" : "translateY(-50px)"};
    }
    @media (max-width: 700px) {
        width: 60%;
    }
    @media (max-width: 600px) {
        width: 70%;
    }
    @media (max-width: 500px) {
        left: 50%;
        width: 90%;
        transform: ${props => props.isOpen ? "translate(-50%, 0)" : "translate(-50%, -50px)"};
    }
`;
export const StyledMenuItem = styled.li`
    padding: 10px 20px;
    border-bottom: 1px solid #CCC;
    display: flex;
    align-items: center;
`;
export const MenuIcon = styled.span`
    margin-right: 10px;
`;
export const StyledLink = styled(Link)`
    text-decoration: none;
    color: inherit;
    &:hover {
        color: #3498db;
    }
`;

const ChatModal = () => {
    const {selectedPage, setSelectedPage, roomId, isMenuOpen, setIsMenuOpen} = useContext(ChatContext);
    const [confirm, setConfirm] = useState("");
    const dispatch = useDispatch();

    const toggleMenu = () => {
        if (Commons.isLoggedIn()){
            if (isMenuOpen) {
                setTimeout(() => {
                    setSelectedPage("chatList");
                }, 100);
            }
            setIsMenuOpen(!isMenuOpen);
            return
        }
        setConfirm("로그인 후에 가능합니다 \n 로그인 하시겠습니까?")
    };

    const renderSelectedPage = () => {
        switch (selectedPage) {
            case "chatList":
                return <ChatList setSelectedPage={setSelectedPage}/>;
            case "openChatSearch":
                return <OpenChatSearch setSelectedPage={setSelectedPage}/>;
            case "chatBot":
                return <ChatBot/>;
            case "chatting":
                return <Chatting setSelectedPage={setSelectedPage} roomId={roomId}/>;
            case "chatRoomCreate":
                return <ChatRoomCreate setSelectedPage={setSelectedPage}/>;
            default:
                return null;
        }
    };

    return (
        <Container>
            <ChatIconBox onClick={toggleMenu}>
                {isMenuOpen ? (
                    <ChatIcon src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/chat.png?alt=media"} alt="Open"/>
                ) : (
                    <ChatIcon src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/close.png?alt=media"} alt="Close"/>
                )}
            </ChatIconBox>
            <StyledSideMenu isOpen={isMenuOpen}>
                <SelectPage>{renderSelectedPage()}</SelectPage>
                <ChatMenuBar setSelectedPage={setSelectedPage} selectedPage={selectedPage}/>
            </StyledSideMenu>
            {/* <Dummy /> */}
            <main className="body" style={{minHeight: "100vh"}}>
                <Outlet />
            </main>
            <ConfirmModal open={confirm} onConfirm={() => {dispatch(setLoginModalOpen(true)); setConfirm("")}} message={confirm} onCancel={() => setConfirm("")} />
        </Container>
    );
};
export default ChatModal;