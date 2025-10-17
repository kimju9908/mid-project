import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";

import {fetchUserStatus} from "../function/fetchUserStatus";
import {useDispatch, useSelector} from "react-redux";
import AuthApi from "../api/AuthApi";
import {logout} from "../context/redux/PersistentReducer";
import Commons from "../util/Common";
import ConfirmModal from "./Modal/ConfirmModal";
import {setLoginModalOpen} from "../context/redux/ModalReducer";



const Background = styled.div`
  width: 100%;
  height: 100%;
`;

const Container = styled.div`
  width: 100%;
  margin-top: 3%;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const Left = styled.div`
  width: 25%;
  padding-left: 5%;
  display: flex;
  flex-direction: column;

  @media (max-width:768px) {
    display: none;
  }
`;

const LeftTitle = styled.div`
  margin-bottom: 10%;
  font-size: clamp(1.3rem, 1.8vw, 2.5rem);
  font-weight: bold;
`;

const SubTitle1 = styled.div`
  font-size: clamp(1rem, 1vw, 2.5rem);
  font-weight: bold;
  margin-bottom: 5%;
  margin-top: 5%;

  p {
    margin-top: 2%;
    font-size: clamp(0.8rem, 1vw, 1rem);
    font-weight: normal;
    cursor: pointer;
  }
`;

const SubTitle2 = styled.div`
  font-size: clamp(1rem, 1vw, 2.5rem);
  font-weight: bold;
  margin-bottom: 5%;
  margin-top: 5%;

  p {
    margin-top: 2%;
    font-size: clamp(0.8rem, 1vw, 1rem);
    font-weight: normal;
    cursor: pointer;
  }
`;

const SubTitle3 = styled.div`
  font-size: clamp(1rem, 1vw, 2.5rem);
  font-weight: bold;
  margin-bottom: 5%;
  margin-top: 5%;

  p {
    margin-top: 2%;
    font-size: clamp(0.8rem, 1vw, 1rem);
    font-weight: normal;
    cursor: pointer;
  }
`;

const SubTitle4 = styled.div`
  font-size: clamp(1rem, 1vw, 2.5rem);
  font-weight: bold;
  margin-bottom: 5%;
  margin-top: 5%;

  p {
    margin-top: 2%;
    font-size: clamp(0.8rem, 1vw, 1rem);
    font-weight: normal;
    cursor: pointer;
  }
`;

const SubTitle5 = styled.div`
 font-size: clamp(1rem, 1vw, 2.5rem);
  font-weight: bold;
  margin-bottom: 5%;
  margin-top: 5%;

  p {
    margin-top: 2%;
    font-size: clamp(0.8rem, 1vw, 1rem);
    font-weight: normal;
    cursor: pointer;
  }
`;

const Right = styled.div`
  width: 70%;

  @media (max-width: 768px) {
    width: 85%;
  }
`;

const MyPageNavBar = () => {
  const navigate = useNavigate(); // 페이지 전환 훅
  const role = useSelector(state => state.persistent.role)
  const [confirm, setConfirm] = useState({});
  const dispatch = useDispatch()
  useEffect(() => {
    if(role === "REST_USER" || role === "" ) {
      setConfirm({value: true, label: "해당 기능은 로그인 후 사용 가능 합니다. \n 로그인 하시겠습니까?"})
    }
  }, [role]);
  
  useEffect(() => {
    fetchUserStatus();
  }, []);


  const deleteId = async () => {
    try {
      const rsp = await AuthApi.deleteId();
      if(rsp.data) {
        dispatch(logout())
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Background>
        <Container>
          <Left>
            <LeftTitle>마이 페이지</LeftTitle>
            <SubTitle1>
              나의 계정정보
              <p onClick={() => navigate("memberEdit")}>회원정보수정</p>
              <p onClick={() => navigate("permission")}>업로드 권한 확인</p>
              <p onClick={() => navigate("withdrawal")}>수익금 정산</p>
              <p onClick={()=>deleteId()}>계정탈퇴</p>
            </SubTitle1>

            <SubTitle2>
              나의 구매목록
              <p onClick={() => navigate("purchasedEnumPS")}>구매한 자기소개서</p>
              <p onClick={() => navigate("purchasedEnumSR")}>구매한 생활기록부</p>
            </SubTitle2>

            <SubTitle3>
              내가 작성한 글
              <p onClick={() => navigate(`post/list/default/${Commons.getTokenByMemberId()}/member`)}>게시글</p>
              <p onClick={() => navigate(`post/list/review/${Commons.getTokenByMemberId()}/member`)}>이용후기</p>
            </SubTitle3>
            
            <SubTitle4>
              자료 업로드
              <p onClick={() => navigate("coverLetterRegister")}>자소서/생기부</p>
            </SubTitle4>

            <SubTitle5>
              내가 업로드한 파일
              <p onClick={() => navigate("UploadedEnumPS")}>자기소개서</p>
              <p onClick={() => navigate("UploadedEnumSR")}>생활기록부</p>
            </SubTitle5>
          </Left>
          <Right>
            <Outlet />
          </Right>
        </Container>
        <ConfirmModal message={confirm.label} open={confirm.value} onCancel={() => navigate("/")} onConfirm={ () => {dispatch(setLoginModalOpen(true)); setConfirm({})}}/>
      </Background>
    </>
  );
};

export default MyPageNavBar;
