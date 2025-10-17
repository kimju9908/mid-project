import React, { useContext, useEffect, useState } from "react";
import { Box, Paper, Typography, Stack } from "@mui/material";
import { PermissionContext } from "../../../../context/admin/PermissionStore";
import styled from "styled-components";
import AdminApi from "../../../../api/AdminApi";
import Commons from "../../../../util/Common";
import {Dropdown} from "../../../../styles/SmallComponents";

const data = [
	{ label: "이름", id: "name" },
	{ label: "이메일", id: "nickname" },
	{ label: "대학교", id: "univName", select: true },
	{ label: "학과", id: "univDept", select: true },
	{ label: "권한", id: "authority", select: true},
	{ label: "상태", id: "active" },
	{ label: "등록 날짜", id: "regDate" },
	{ label: "은행 이름", id: "bankName" },
	{ label: "계좌 번호", id: "bankAccount" },
	{ label: "출금 요구 금액", id: "withdrawal"}
];

const authorityList = [
	{ value: "ROLE_ADMIN", label : "관리자 계정"},
	{ value: "ROLE_UNIV", label: "대학생 회원"},
	{ value: "ROLE_USER", label: "일반 회원"},
	{ value: "REST_USER", label: "휴면 회원"},
]

const MemberItemDetail = () => {
	const { member, setUniv, univList, setUnivList, setAuthority, univNameList, univ } = useContext(PermissionContext);
	const [selectedUniv, setSelectedUniv] = useState("");
	
	
	
	
	// 대학교 선택 시 학과 목록 가져오기
	useEffect(() => {
		const fetchDeptList = async () => {
			try {
				if (selectedUniv) {
					const rsp = await AdminApi.getDeptList(selectedUniv);
					if (rsp.status === 200) {
						setUnivList(rsp.data); // 컨텍스트 업데이트
					}
				} else {
					setUnivList([]); // 대학교 선택 해제 시 학과 목록 초기화
				}
			} catch (error) {
				console.error("학과 목록 가져오기 오류:", error);
			}
		};
		fetchDeptList();
	}, [selectedUniv]);
	
	const onChangeUniv = (e) => {
		setSelectedUniv(e.target.value);
		setUniv(""); // 대학교 선택시 학과 초기화
	};
	
	const onChangeDept = (e) => {
		setUniv(e.target.value);
	}
	
	const onChangeAuthority = (e) => {
		setAuthority(e.target.value);
	}
	
	return (
		<Paper elevation={3} sx={{ padding: 3, maxWidth: 400, margin: "auto" }}>
			<Typography variant="h6" gutterBottom>
				사용자 정보
			</Typography>
			<Stack spacing={2}>
				{data.map((item, index) => {
					const value = member[item.id] || "정보 없음";
					
					return item.select ? (
						<Box
							key={index}
							sx={{
								display: "flex",
								justifyContent: "space-between",
								borderBottom: index !== data.length - 1 ? "1px solid #ddd" : "none",
								pb: 1,
							}}
						>
							<Typography variant="subtitle1" fontWeight="bold">
								{item.label}
							</Typography>
							{item.id === "univName" ? (
								<Dropdown onChange={onChangeUniv} value={selectedUniv || member.univName}>
									<option value="">대학교 선택</option>
									{univNameList.map((univ, index) => (
										<option key={index} value={univ}>
											{univ}
										</option>
									))}
								</Dropdown>
							) : (
								item.id === "univDept" ? (
								<Dropdown onChange={onChangeDept} disabled={!selectedUniv} value={univ || member.univDept}>
									<option value="">학과 선택</option>
									{univList.map((dept, index) => (
										<option key={index} value={dept.univId}>
											{dept.univDept}
										</option>
									))}
								</Dropdown>
							) : (
								item.id === "authority" ? (
										<Dropdown onChange={onChangeAuthority} value={member.authority}>
											<option value="">권한 선택</option>
											{authorityList.map((auth, index) => (
												<option key={index} value={auth.value}>
													{auth.label}
												</option>
											))}
										</Dropdown>
								) :
									(
										<div>잘못된 코딩!!!!!!</div>
									)
								))}
						</Box>
					) : (
						<Box
							key={index}
							sx={{
								display: "flex",
								justifyContent: "space-between",
								borderBottom: index !== data.length - 1 ? "1px solid #ddd" : "none",
								pb: 1,
							}}
						>
							<Typography variant="subtitle1" fontWeight="bold">
								{item.label}
							</Typography>
							{item.id.includes("Date") ? <Typography variant="body1">{value === "정보 없음" ? "정보 없음" : Commons.formatDate(value)}
							</Typography> : <Typography variant="body1">{value}</Typography>}
						</Box>
					);
				})}
			</Stack>
		</Paper>
	);
};

export default MemberItemDetail;


