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

// 계정 탈퇴 모달 스타일
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
  text-align: center;
`;

const ModalMessage = styled.p`
  font-size: 16px;
  color: #666;
  margin-bottom: 12px;
  text-align: center;
  line-height: 1.5;
`;

const ModalWarning = styled.p`
  font-size: 14px;
  color: #ff4444;
  margin-bottom: 24px;
  text-align: center;
  line-height: 1.5;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const Button = styled.button`
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CancelButton = styled(Button)`
  background-color: #f5f5f5;
  color: #666;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const ConfirmButton = styled(Button)`
  background-color: #ff4444;
  color: white;

  &:hover {
    background-color: #cc0000;
  }
`;

const MyPageNavBar = () => {
  const navigate = useNavigate();
  const role = useSelector(state => state.persistent.role);
  const [confirm, setConfirm] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false); // 탈퇴 모달 상태
  const dispatch = useDispatch();

  useEffect(() => {
    if(role === "REST_USER" || role === "" ) {
      setConfirm({value: true, label: "해당 기능은 로그인 후 사용 가능 합니다. \n 로그인 하시겠습니까?"})
    }
  }, [role]);

  useEffect(() => {
    fetchUserStatus();
   
  }, []);

  // 계정 탈퇴 처리
  const deleteId = async () => {
    try {
      const rsp = await AuthApi.deleteId();
      if(rsp.data) {
        alert('계정이 탈퇴되었습니다.');
        setShowDeleteModal(false);
        dispatch(logout());
        navigate('/');
      }
    } catch (e) {
      console.error(e);
      alert('계정 탈퇴에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 탈퇴 모달 열기
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // 탈퇴 모달 닫기
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
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
                <p onClick={handleDeleteClick}>계정탈퇴</p>
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

          {/* 기존 로그인 확인 모달 */}
          <ConfirmModal
              message={confirm.label}
              open={confirm.value}
              onCancel={() => navigate("/")}
              onConfirm={() => {dispatch(setLoginModalOpen(true)); setConfirm({})}}
          />

          {/* 계정 탈퇴 확인 모달 */}
          {showDeleteModal && (
              <ModalOverlay onClick={handleCancelDelete}>
                <ModalContainer onClick={(e) => e.stopPropagation()}>
                  <ModalTitle>계정 탈퇴</ModalTitle>
                  <ModalMessage>정말 계정을 탈퇴하시겠습니까?</ModalMessage>
                  <ModalWarning>
                    탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
                  </ModalWarning>
                  <ButtonContainer>
                    <CancelButton onClick={handleCancelDelete}>취소</CancelButton>
                    <ConfirmButton onClick={deleteId}>확인</ConfirmButton>
                  </ButtonContainer>
                </ModalContainer>
              </ModalOverlay>
          )}
        </Background>
      </>
  );
};

export default MyPageNavBar;