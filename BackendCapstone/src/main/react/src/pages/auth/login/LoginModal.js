import React, { useState } from "react";
import {
  ModalOverlay,
  SocialButtonsContainer,
  NaverButton,
  KakaoButton,
  GoogleButton,
  LogoImg,
  ModalContent,
  InputField,
  Button,
  TextButtonContainer,
  TextButton,
  Slash,
  SignupTextButton,
  Line,
  SnsLoginText,
} from "./LoginModal.styles";
import AuthApi from "../../../api/AuthApi";
import SignupModal from "../signup/SingupModal";
import FindPw from "../findPw/FIndPw";
import FindIdByPhone from "../findId/FindIdByPhone";
 
import RejectModal from "../../../component/Modal/RejectModal";
import {fetchUserStatus} from "../../../function/fetchUserStatus";
import Commons from "../../../util/Common";
 


// 도메인 및 API URL 설정


const LoginModal = ({ closeModal }) => {
  const DOMAIN = 'http://localhost:8111'; // 도메인 수정
  const API_DOMAIN = `${DOMAIN}/api/v1`;
  const SNS_SIGN_IN_URL = (type) => `${API_DOMAIN}/auth/oauth2/${type}`;
  const onSnsSignInButtonClickHandler = (type) => {
    window.location.href = SNS_SIGN_IN_URL(type);
  };
  
  const [inputEmail, setInputEmail] = useState("");
  const [inputPw, setInputPw] = useState("");
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isFindIdModalOpen, setIsFindIdModalOpen] = useState(false);
  const [isFindPwModalOpen, setIsFindPwModalOpen] = useState(false);
  const [reject, setReject] = useState({});
  
  // 로그인시 MainPage 이동(로그인시 자료구매현황을 확인해서 구매한자료인지 아닌지 파악하기위함)
  
  
  const handleInputChange = (e, setState) => {
    setState(e.target.value);
  };
  
  const onClickLogin = async () => {
    try {
      const res = await AuthApi.login(inputEmail, inputPw);
      if (res.data.grantType === "Bearer") {
        console.log(res);
        Commons.setAccessToken(res.data.accessToken)
        Commons.setRefreshToken(res.data.refreshToken)
        fetchUserStatus();
        closeModal();
      } else {
        console.log("잘못된 아이디 또는 비밀번호 입니다.");
        setReject({message : "ID와 PW가 다릅니다.", active: true});
      }
    } catch (err) {
      console.log("로그인 에러 : " + err);
      if (err.response && err.response.status === 405) {
        console.log("로그인 실패: 405 Unauthorized");
        setReject({message : "로그인에 실패하였습니다.", active: true});
      } else {
        console.log("로그인 에러 : " + err);
        setReject({message : "서버와의 통신에 실패했습니다.", active: true});
      }
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      
      e.preventDefault(); // 엔터 키가 눌렸을 때
      onClickLogin();          // 로그인 버튼 클릭 함수 실행
    }
  };
  
  const openSignupModal = () => {
    setIsSignupModalOpen(true);
  };
  
  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };
  
  const openFindIdModal = () => {
    setIsFindIdModalOpen(true);
  };
  
  const closeFindIdModal = () => {
    setIsFindIdModalOpen(false);
  };
  
  const openFindPwModal = () => {
    setIsFindPwModalOpen(true);
  };
  
  const closeFindPwModal = () => {
    setIsFindPwModalOpen(false);
  };
  
  return (
    <>
      <ModalOverlay onClick={closeModal} />
      <ModalContent>
        <h2>로그인</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <InputField
            type="text"
            placeholder="이메일"
            value={inputEmail}
            onChange={(e) => handleInputChange(e, setInputEmail)}
            onKeyDown={handleKeyPress}
          />
          <InputField
            type="password"
            placeholder="비밀번호"
            value={inputPw}
            onChange={(e) => handleInputChange(e, setInputPw)}
            onKeyDown={handleKeyPress}
          />
          <Button type="button" onClick={onClickLogin}>
            로그인
          </Button>
          
          
          {/* 아이디찾기 / 비밀번호 찾기 */}
          <TextButtonContainer>
            <div>
              <TextButton onClick={openFindIdModal}>이메일 찾기</TextButton>
              <Slash>/</Slash>
              <TextButton onClick={openFindPwModal}>비밀번호 찾기</TextButton>
            </div>
            <SignupTextButton onClick={openSignupModal}>회원가입</SignupTextButton>
          </TextButtonContainer>
          
          {/* 라인 및 SNS 로그인 섹션 */}
          <Line />
          <SnsLoginText>SNS 계정 간편 로그인</SnsLoginText>
          <SocialButtonsContainer>
            <NaverButton onClick={() => onSnsSignInButtonClickHandler('naver')}>
              <LogoImg src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/.png?alt=media"}/>
              <p>네이버 로그인</p>
            </NaverButton>
            <KakaoButton onClick={() => onSnsSignInButtonClickHandler('kakao')}>
              <LogoImg src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/kakao.png?alt=media"}/>
              <p>카카오 로그인</p>
            </KakaoButton>
            <GoogleButton onClick={() => onSnsSignInButtonClickHandler('google')}>
              <LogoImg src="https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/google.png?alt=media" />

              <p>구글 로그인</p>
            </GoogleButton>
          </SocialButtonsContainer>

        </form>
      </ModalContent>

      {isSignupModalOpen && <SignupModal closeModal={closeSignupModal} />}
      {isFindIdModalOpen && <FindIdByPhone closeModal={closeFindIdModal} />}
      {isFindPwModalOpen && <FindPw closeModal={closeFindPwModal} />}
      <RejectModal open={reject.active} message={reject.message} onClose={() => setReject("")}></RejectModal>
    </>
  );
};

export default LoginModal;