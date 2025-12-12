import { useContext, useEffect, useState } from "react";
import AdminApi from "../../../api/AdminApi";
import { PermissionContext } from "../../../context/admin/PermissionStore";
import { BackGround } from "../../../styles/GlobalStyle";
import { Box } from "@mui/material";
import styled from "styled-components";

const SettlementMain = () => {
	const { setPage } = useContext(PermissionContext);
	const [settlementList, setSettlementList] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setPage("settlement");
	}, []);

	useEffect(() => {
		fetchSettlementList();
	}, []);

	const fetchSettlementList = async () => {
		try {
			setLoading(true);
			const response = await AdminApi.getSettlementList();
			console.log("정산 목록 조회 : ", response);
			
			if (response && response.data) {
				setSettlementList(response.data);
			}
		} catch (error) {
			console.error("정산 목록 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSettlement = async (userBankId) => {
		if (!window.confirm("정산을 처리하시겠습니까?")) {
			return;
		}

		try {
			const response = await AdminApi.processSettlement(userBankId);
			console.log("정산 처리 결과 : ", response);
			
			if (response && response.data) {
				alert("정산이 완료되었습니다.");
				// 목록 새로고침
				fetchSettlementList();
			} else {
				alert("정산 처리에 실패했습니다.");
			}
		} catch (error) {
			console.error("정산 처리 실패:", error);
			alert("정산 처리 중 오류가 발생했습니다.");
		}
	};

	const formatCurrency = (amount) => {
		if (!amount) return "0원";
		return new Intl.NumberFormat("ko-KR").format(amount) + "원";
	};

	return (
		<BackGround>
			<Box sx={styles.container}>
				<Title>수익금 정산 페이지</Title>
				{loading ? (
					<LoadingText>로딩 중...</LoadingText>
				) : (
					<TableContainer>
						<Table>
							<thead>
								<TableRow>
									<TableHeader>유저 이름</TableHeader>
									<TableHeader>은행 이름</TableHeader>
									<TableHeader>계좌번호</TableHeader>
									<TableHeader>금액</TableHeader>
									<TableHeader>정산하기</TableHeader>
								</TableRow>
							</thead>
							<tbody>
								{settlementList && settlementList.length > 0 ? (
									settlementList.map((item) => (
										<TableRow key={item.userBankId}>
											<TableCell>{item.memberName || "-"}</TableCell>
											<TableCell>{item.bankName || "-"}</TableCell>
											<TableCell>{item.bankAccount || "-"}</TableCell>
											<TableCell>{formatCurrency(item.withdrawal)}</TableCell>
											<TableCell>
												<SettlementButton
													onClick={() => handleSettlement(item.userBankId)}
												>
													정산하기
												</SettlementButton>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan="5" style={{ textAlign: "center" }}>
											정산할 내역이 없습니다.
										</TableCell>
									</TableRow>
								)}
							</tbody>
						</Table>
					</TableContainer>
				)}
			</Box>
		</BackGround>
	);
};

const styles = {
	container: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "20px",
		width: "100%",
		maxWidth: "1200px",
	},
};

const Title = styled.h1`
	font-size: 28px;
	font-weight: bold;
	margin-bottom: 30px;
	color: #333;
`;

const TableContainer = styled.div`
	width: 100%;
	overflow-x: auto;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	border-radius: 8px;
`;

const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
	background-color: white;
`;

const TableHeader = styled.th`
	padding: 15px;
	text-align: left;
	background-color: #6154D4;
	color: white;
	font-weight: bold;
	font-size: 16px;
	border-bottom: 2px solid #ddd;
`;

const TableRow = styled.tr`
	&:nth-child(even) {
		background-color: #f9f9f9;
	}
	&:hover {
		background-color: #f0f0f0;
	}
`;

const TableCell = styled.td`
	padding: 15px;
	border-bottom: 1px solid #ddd;
	font-size: 14px;
	color: #333;
`;

const SettlementButton = styled.button`
	background-color: #6154D4;
	color: white;
	border: none;
	padding: 8px 16px;
	border-radius: 6px;
	cursor: pointer;
	font-size: 14px;
	font-weight: bold;
	transition: all 0.2s ease;

	&:hover {
		background-color: #4a3fb8;
		transform: scale(1.05);
	}

	&:active {
		transform: scale(0.98);
	}
`;

const LoadingText = styled.div`
	text-align: center;
	font-size: 18px;
	color: #666;
	padding: 40px;
`;

export default SettlementMain;

