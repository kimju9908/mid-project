import React from 'react';
import styled from 'styled-components';
import {Link, useNavigate} from "react-router-dom";
import {IconButton, Tooltip, Typography} from "@mui/material";
import { Android, Apple } from '@mui/icons-material';

const FooterContainer = styled.footer`
    display: flex;
		position: relative;
		bottom: 0;
		width: 100%;
    justify-content: space-evenly;
    align-items: center;
    padding: 20px;
    background-color: #333;
    color: white;
    font-size: 14px;
    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
		    gap: 10px;
    }
`;

const LeftSection = styled.div`
    display: flex;
    gap: 20px;
    flex-direction: column;
`;

const RightSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
`;

const FooterLink = styled(Link)`
    color: white;
		font-size: 1.2rem;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
`;

const StoreIcons = styled.div`
  display: flex;
  gap: 15px;
  font-size: 24px;
  color: white;

  a {
    text-decoration: none;
    color: inherit;
  }

  a:hover {
    color: #ff9900;
  }
`;

const Footer = () => {
	const navigator = useNavigate();
	return (
		<FooterContainer>
			<LeftSection>
				<Typography sx={{fontSize: "0.8rem"}}>관리자 이메일</Typography>
				<Typography sx={{fontSize: "0.8rem"}}>sdx02013@ajou.ac.kr</Typography>
			</LeftSection>
			<RightSection>
				<FooterLink to="/privacy-policy">약관</FooterLink>
				<FooterLink to="/post/list/faq">FAQ</FooterLink>
			</RightSection>
			<StoreIcons>
				<Tooltip title="플레이 스토어">
					<IconButton onClick={() => navigator("#")} ><Android sx={{color: 'white'}} /></IconButton>
				</Tooltip>
				<Tooltip title="앱 스토어">
					<IconButton onClick={() => navigator("#")} ><Apple sx={{color: 'white'}} /></IconButton>
				</Tooltip>
			</StoreIcons>
			<Copyright></Copyright>
		</FooterContainer>
	);
};

export default Footer;
