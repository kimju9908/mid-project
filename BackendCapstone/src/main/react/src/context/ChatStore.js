import { createContext, useState } from "react";


export const ChatContext = createContext(null);

const ChatStore = ({children}) => {
    const [selectedPage, setSelectedPage] = useState("chatList");
    const [roomId, setRoomId] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(true);    // Side Bar 메뉴 열고 닫기
    return (
        <ChatContext.Provider value={{selectedPage, setSelectedPage, roomId, setRoomId, isMenuOpen, setIsMenuOpen}}>
            {children}
        </ChatContext.Provider>
    );
}
export default ChatStore;