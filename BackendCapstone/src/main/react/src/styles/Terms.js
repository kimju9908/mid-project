import {BackGround} from "./GlobalStyle";
import {privacyPolicy, termsOfService} from "../pages/auth/signup/SingupModal";
import styled from "styled-components";

const Terms = () => {
 
	return (
		<BackGround>
			<TitleContainer>
				UniGuide 서비스 이용약관
			</TitleContainer>
			<ContentContainer>
				{termsOfService}
			</ContentContainer>
			<TitleContainer>
				개인정보 처리방침
			</TitleContainer>
			<ContentContainer>
				{privacyPolicy}
			</ContentContainer>
		</BackGround>
	)
}
export default Terms

const TitleContainer = styled.div`
	margin : 10px auto;
`
const ContentContainer = styled.div`
	margin : 0 auto;
`