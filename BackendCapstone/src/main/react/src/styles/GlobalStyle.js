import styled, { createGlobalStyle } from "styled-components";
const GlobalStyle = createGlobalStyle`

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: "Nanum Gothic", serif;
        font-optical-sizing: auto;
        font-weight: 400;
        font-style: normal;
        & img {
            -webkit-user-drag: none;
            -khtml-user-drag: none;
            -moz-user-drag: none;
            -o-user-drag: none;
            user-drag: none;
        }
    }

`;

export const BackGround = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default GlobalStyle;
