import styled, {keyframes} from "styled-components";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

// Container 스타일
const Container = styled.div`
    width: 100%;
    overflow-x: hidden;
    //background-color: #EEE;
`;

// SlideBanner 스타일
const SlideBanner = styled.div`
    width: 90%;
    height: 45dvh;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10vw;
    margin: 3vw auto;
    border-radius: 30px;
    transition: all 1s ease-in-out;
        /*    transform: ${({ isVisible, direction }) =>
            isVisible
                    ? "translateX(0)"
                    : direction === "left"
                            ? "translateX(-100%)"
                            : "translateX(100%)"};*/
    transform: ${({ isVisible, direction }) =>
            isVisible
                    ? "translateX(0)"
                    : direction === "left"
                            ? "translateX(-100%)"
                            : "translateX(100%)"};
    opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
    &.firstBanner {
        width: 100%;
        height: 30dvh;
        margin-top: 0;
        left: 50%;
        transform: translateX(-50%);
        opacity: 1;
        border-radius: 0;
    }
    @media (max-width: 768px) {
        justify-content: space-around;
        flex-direction: column;
        gap: 0;
        margin: 5dvh auto 0 auto;
        &.reverse {
            flex-direction: column-reverse;
        }
    }
    @media (max-width: 490px) {
        height: 70dvh;
    }
    @media (max-width: 390px) {
        height: 80dvh;
    }
`;

const LastBanner = styled.div`
    width: 100%;
    height: 45dvh;
    min-height: 450px;
    background-color: #c2e4ff78;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
`

const LastBannerInner = styled.div`
    width: 50%;
    z-index: 100;
`

const CopyButton = styled.button`
    float: right;
    background-color: #6054d6;
    color: #FFF;
    width: 220px;
    padding: 20px;
    margin-top: 2vw;
    border: none;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1vw;
    cursor: pointer;
    font-size: 1.2rem;
    transition: background-color 0.3s;
    z-index: 10;
    & > p {
        color: #FFF;
        font-size: 1.3rem;
        @media (max-width: 768px) {
            font-size: 1.1rem;
        }
    }
    &:hover {
        background-color: #4a3ba9;
    }
    @media (max-width: 768px) {
        width: 55%;
    }
    @media (max-width: 660px) {
        width: 70%;
    }
    @media (max-width: 500px) {
        width: 80%;
    }
    @media (max-width: 460px) {
        width: 90%;
        padding: 15px;
    }
`;

const Message = styled.p`
    margin-top: 10px;
    color: #424242;
    font-size: 14px;
`;

const BgGradient = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    background-image: linear-gradient(to right, #FFF, #e0cefe, #6054d6);
    opacity: 0.3;
`;

const BannerTxt = styled.p`
    font-size: clamp(89%, 3vw, 150%);
    font-weight: bold;
    line-height: 3rem;
`;

const StartIcon = styled.div`
    background: #FFF;
    margin-left: 1em;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.2em;
    width: 2.2em;
    border-radius: 100px;
    box-shadow: 0.1em 0.1em 0.6em 0.2em #7b52b9;
    right: 1em;
    transition: all 0.3s;
`;

const StartBtnSvg = styled.svg`
    width: 1em;
    transition: transform 0.3s;
    color: #7b52b9;
`;

const StartBtn = styled.button`
    float: right;
    background: #6054d6;
    width: 15rem;
    height: 4rem;
    color: white;
    font-family: inherit;
    padding: 0.35em 3.3em 0.35em 1.2em;
    font-size: 17px;
    font-weight: 500;
    border-radius: 100px;
    border: none;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    box-shadow: inset 0 0 1.6em -0.6em #714da6;
    overflow: hidden;
    position: relative;
    cursor: pointer;

    &:hover ${StartIcon} {
        width: calc(100% - 2em);
    }
    &:hover ${StartBtnSvg} {
        transform: translateX(0.1em);
    }
    &:active ${StartIcon} {
        transform: scale(0.95);
    }
`;

const floatAnimation = keyframes`
    0% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-15px);
    }
    100% {
        transform: translateY(0);
    }
`;

const Icon = styled.img`
    height: 80%;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 1));
    animation: ${floatAnimation} 2s ease-in-out infinite;
    @media (max-width: 768px) {
        animation: none;
    }
`;

const HalfBox = styled.div`
    //height: 80%;
    width: 20%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2vw;
    position: relative;
    &.first{
        align-items: center;
        z-index: 100;
    }
    &.txt {
        width: 30%;
        @media (max-width: 768px) {
            width: 50%;
        }
        @media (max-width: 390px) {
            width: 65%;
        }
    }
    &.left {
        text-align: right;
    }
    @media (max-width: 1300px) {
        width: 22%;
    }
    @media (max-width: 1000px) {
        width: 30%;
        &:nth-child(3) {
            width: 38%;
            align-items: center;
        }
    }
    @media (max-width: 600px) {
        width: 35%;
    }
`;

const BgBox = styled.div`
    height: 80%;
    aspect-ratio: 1 / 1;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
    background-image: linear-gradient(144deg, #00ddeb, #5b42f3 50%, #af40ff);
    @media (max-width: 768px) {
        height: 100%;
        border-radius: 100px;
    }
`

const BgBoxInner = styled.div`
    height: 93%;
    aspect-ratio: 1 / 1;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
    background-color: rgba(255, 255, 255, 0.5);
    @media (max-width: 768px) {
        border-radius: 100px;
    }
`

const Point = styled.h1`
    font-size: 4rem;
    line-height: 7rem;
    font-weight: bold;
    text-shadow:
            0.3px 0 black,   /* 오른쪽 */
            -0.3px 0 black,  /* 왼쪽 */
            0 0.3px black,   /* 아래쪽 */
            0 -0.3px black,  /* 위쪽 */
            0.3px 0.3px black, /* 오른쪽 아래 */
            -0.3px -0.3px black, /* 왼쪽 위 */
            0.3px -0.3px black, /* 오른쪽 위 */
            -0.3px 0.3px black; /* 왼쪽 아래 */
    @media (max-width: 900px) {
        font-size: 2.5rem;
    }
    @media (max-width: 768px) {
        font-size: 2rem;
    }
`

const Title = styled.h1`
    font-size: 2rem;
    line-height: 3rem;
    font-weight: bold;
    word-break: keep-all;
    text-shadow:
            0.3px 0 black,   /* 오른쪽 */
            -0.3px 0 black,  /* 왼쪽 */
            0 0.3px black,   /* 아래쪽 */
            0 -0.3px black,  /* 위쪽 */
            0.3px 0.3px black, /* 오른쪽 아래 */
            -0.3px -0.3px black, /* 왼쪽 위 */
            0.3px -0.3px black, /* 오른쪽 위 */
            -0.3px 0.3px black; /* 왼쪽 아래 */
    &.last { text-shadow: none; }
    @media (max-width: 900px) {
        font-size: 1.7rem;
        text-shadow: none;
    }
    @media (max-width: 768px) {
        font-size: 1.3rem;
        text-align: center;
    }
    &:nth-child(2) { text-align: left; }
`;

const Content = styled.h3`
    font-size: clamp(18px, 2vw, 28px);
    line-height: 3rem;
    color: #424242;
    word-break: keep-all;
    @media (max-width: 768px) {
        text-align: center;
    }
`;

const ShareIcon = styled.img`
    width: 25px;
`
const TopShape = styled.img`
    position: absolute;
    width: 100px;
    height: auto;
    animation: ${floatAnimation} 4s ease-in-out infinite;
    &:nth-child(2) { top: 60px; left: 15%; transform: rotate(15deg); }
    &:nth-child(3) { top: 50%; left: 30px; transform: rotate(-10deg); }
    &:nth-child(4) { bottom: 20px; left: 25%; transform: rotate(30deg); }
    &:nth-child(5) { top: 10px; left: 45%; transform: rotate(-25deg); }
    &:nth-child(6) { bottom: 10px; right: 25%; transform: rotate(5deg); }
    &:nth-child(7) { top: 50%; right: 30px; transform: rotate(-10deg); }
    &:nth-child(8) { top: 70px; right: 15%; transform: rotate(15deg); }
    @media (max-width: 1220px) {
        width: 80px;
    }
    @media (max-width: 1000px) {
        width: 60px;
    }
    @media (max-width: 500px) {
        &:nth-child(5) { bottom: 120px; left: 40%; transform: rotate(-25deg); }
    }
`;

const Shape = styled.img`
    position: absolute;
    width: 100px;
    height: auto;
    animation: ${floatAnimation} 4s ease-in-out infinite;
    &:nth-child(2) { top: 20px; left: 10%; transform: rotate(15deg); }
    &:nth-child(3) { top: 50%; left: 30px; transform: rotate(-10deg); }
    &:nth-child(4) { bottom: 20px; left: 20%; transform: rotate(30deg); }
    &:nth-child(5) { bottom: 120px; left: 45%; transform: rotate(-25deg); }
    &:nth-child(6) { bottom: 30px; right: 25%; transform: rotate(5deg); }
    &:nth-child(7) { top: 40%; right: 30px; transform: rotate(-10deg); }
    &:nth-child(8) { top: 30px; right: 10%; transform: rotate(-10deg); }
    &:nth-child(9) { top: 100px; right: 30%; transform: rotate(-25deg); }
    &:nth-child(10) { top: 80px; left: 35%; transform: rotate(30deg); }
    @media (max-width: 1220px) {
        width: 80px;
    }
    @media (max-width: 1000px) {
        width: 60px;
    }
    @media (max-width: 500px) {
        &:nth-child(5) { bottom: 120px; left: 40%; transform: rotate(-25deg); }
    }
`;

const Main = () => {
    const navigate = useNavigate();
    const [copyMessage, setCopyMessage] = useState("");

    const bannerRefs = useRef([]);
    const [visibleBanners, setVisibleBanners] = useState([]);

    useEffect(() => {
        const handleScroll = () => {
            const newVisibleBanners = [];
            bannerRefs.current.forEach((banner, index) => {
                if (banner) {
                    const rect = banner.getBoundingClientRect();
                    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
                        newVisibleBanners[index] = true;
                    } else {
                        newVisibleBanners[index] = false;
                    }
                }
            });
            setVisibleBanners(newVisibleBanners);
        };
        window.addEventListener('scroll', handleScroll);

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopyMessage("링크가 복사되었습니다!");
            setTimeout(() => setCopyMessage(""), 2000);
        });
    };

    return (
        <Container>
            <SlideBanner className="firstBanner">
                <BgGradient />
                <TopShape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2FBooks.png?alt=media"}/>
                <TopShape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2FChatting.png?alt=media"}/>
                <TopShape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2FDocument.png?alt=media"}/>
                <TopShape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2FDownload%20Files.png?alt=media"}/>
                <TopShape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2FFolder.png?alt=media"}/>
                <TopShape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2FGraduation%20Cap.png?alt=media"}/>
                <TopShape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2FDocument.png?alt=media"}/>
                <HalfBox className="first">
                    <BannerTxt>대학교 입학 가이드<br />UniGuide</BannerTxt>
                    <StartBtn>
                        지금 시작하기
                        <StartIcon onClick={() => navigate("/personalStatement")}>
                            <svg
                                height="24"
                                width="24"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M0 0h24v24H0z" fill="none"></path>
                                <path
                                    d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                                    fill="#000"
                                ></path>
                            </svg>
                        </StartIcon>
                    </StartBtn>
                </HalfBox>
            </SlideBanner>

            <SlideBanner
                ref={(el) => (bannerRefs.current[0] = el)}
                isVisible={visibleBanners[0]}
                direction="left"
            >
                <HalfBox>
                    <BgBox>
                        <BgBoxInner>
                            <Icon src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2FLegal.png?alt=media"} />
                        </BgBoxInner>
                    </BgBox>
                </HalfBox>
                <HalfBox className="txt">
                    <Title>합격증명서 업로드</Title>
                    <Content>정부24에서 발급받은 합격증명서를 업로드하면 관리자가 확인 후 자료 업로드 권한을 부여해요.</Content>
                </HalfBox>
            </SlideBanner>

            <SlideBanner
                className="reverse"
                ref={(el) => (bannerRefs.current[1] = el)}
                isVisible={visibleBanners[1]}
                direction="right"
            >
                <HalfBox className="txt">
                    <Title>믿을 수 있는 자기소개서 & 생활기록부</Title>
                    <Content>합격증명서를 통해 인증된 합격자들의 자기소개서와 생활기록부만 게시돼요.</Content>
                </HalfBox>
                <HalfBox>
                    <BgBox>
                        <BgBoxInner>
                            <Icon src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2FDownload Files.png?alt=media"} />
                        </BgBoxInner>
                    </BgBox>
                </HalfBox>
            </SlideBanner>

            <SlideBanner
                ref={(el) => (bannerRefs.current[2] = el)}
                isVisible={visibleBanners[2]}
                direction="left"
            >
                <HalfBox>
                    <BgBox>
                        <BgBoxInner>
                            <Icon src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2FChatting.png?alt=media"} />
                        </BgBoxInner>
                    </BgBox>
                </HalfBox>
                <HalfBox className="txt">
                    <Title>자유로운 실시간 채팅</Title>
                    <Content>채팅방을 만들어서 다른 사용자들과 자유로운 실시간 채팅이 가능해요.</Content>
                </HalfBox>
            </SlideBanner>

            <LastBanner>
                <LastBannerInner>
                    <Point>수시,</Point>
                    <Title className="last">
                        합격이 인증된 합격자들의 자료와 함께 준비해요
                    </Title>
                    {copyMessage && <Message>{copyMessage}</Message>}
                    <CopyButton onClick={handleCopyLink}>
                        <p>링크 복사하기</p>
                        <ShareIcon src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2Fshare.png?alt=media"}/>
                    </CopyButton>
                </LastBannerInner>
                <Shape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2Fshape1.png?alt=media"}/>
                <Shape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2Fshape2.png?alt=media"}/>
                <Shape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2Fshape3.png?alt=media"}/>
                <Shape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2Fshape4.png?alt=media"}/>
                <Shape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2Fshape5.png?alt=media"}/>
                <Shape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2Fshape6.png?alt=media"}/>
                <Shape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2Fshape7.png?alt=media"}/>
                <Shape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2Fshape8.png?alt=media"}/>
                <Shape src={"https://firebasestorage.googleapis.com/v0/b/ipsi-f2028.firebasestorage.app/o/firebase%2Fmainicon%2Fshape9.png?alt=media"}/>
            </LastBanner>
        </Container>
    );
};

export default Main;