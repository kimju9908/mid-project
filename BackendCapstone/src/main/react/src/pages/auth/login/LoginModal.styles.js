import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
`;

export const SocialButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const NaverButton = styled.button`
  width: 100%;
  height: 45px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 10px;
  background-color: #03c75a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2vw;
  > p {
    font-size: 16px;
    color: #FFF;
  }
`;

export const KakaoButton = styled.button`
  width: 100%;
  height: 45px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 10px;
  background-color: #fee500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2vw;
  > p {
    font-size: 16px;
    color: #3e2723;
  }
`;

export const GoogleButton = styled.button`
  width: 100%;
  height: 45px;
  border: 1px solid black;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 10px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2vw;
  > p {
    font-size: 16px;
    color: black;
  }
`;

export const LogoImg = styled.img`
  width: 25px;
  cursor: pointer;
`;

export const ModalContent = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  z-index: 9999;
  width: 450px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 600px;
  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
  }
`;

export const InputField = styled.input`
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #dccafc;
  border-radius: 20px;
  box-sizing: border-box;
  font-size: 16px;
  &:focus {
    border-color: #a16eff;
    outline: none;
    box-shadow: 0 0 5px rgba(161, 110, 255, 0.5);
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #5f53d3;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  &:hover {
    background-color: #dccafc;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

export const TextButtonContainer = styled.div`
  margin-top: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const TextButton = styled.button`
  background: none;
  border: none;
  color: black;
  cursor: pointer;
  font-size: 12px;
  text-decoration: underline;
  margin-right: 8px;
  &:hover {
    color: #c1c1c1;
  }
`;

export const Slash = styled.span`
  margin-right: 8px;
  color: black;
  font-size: 12px;
`;

export const SignupTextButton = styled.button`
  background: none;
  border: none;
  color: black;
  cursor: pointer;
  font-size: 12px;
  text-decoration: underline;
  &:hover {
    color: #c1c1c1;
  }
`;

export const Line = styled.div`
  width: 100%;
  height: 1px;
  background-color: #ccc;
  margin: 20px 0;
`;

export const SnsLoginText = styled.div`
  font-size: 14px;
  color: black;
  margin-bottom: 10px;
`;


