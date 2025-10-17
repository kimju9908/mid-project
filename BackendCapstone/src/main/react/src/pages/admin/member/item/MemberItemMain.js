import {BackGround} from "../../../../styles/GlobalStyle";
import {useContext, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import AdminApi from "../../../../api/AdminApi";
import RejectModal from "../../../../component/Modal/RejectModal";
import ConfirmModal from "../../../../component/Modal/ConfirmModal";
import {PermissionContext} from "../../../../context/admin/PermissionStore";
import MemberItemDetail from "./MemberItemDetail";
import {Box, IconButton, Tooltip} from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish";
import CancelIcon from "@mui/icons-material/Cancel";
import styled from "styled-components";



const MemberItemMain = () => {
	const {member, setMember, univ, authority, setUnivNameList, setPage} = useContext(PermissionContext);
	const {id} = useParams();
	const [reject, setReject] = useState({});
	const [confirm, setConfirm] = useState({});
	const navigate = useNavigate();
	
	const fetchMember = async () => {
		try{
			const rsp = await AdminApi.getMemberDetails(id);
			console.log(rsp)
			if(!rsp.data) {
				setReject("멤버 정보가 불러와지지 않았습니다.")
			}
			setMember(rsp.data)
		} catch (error) {
			console.error(error)
			setReject("멤버 정보가 불러와지지 않았습니다.")
		}
	}
	
	useEffect(() => {
		fetchMember();
	}, [id]);
	
	useEffect(() => {
		const fetchUniv = async () => {
			try{
				const rsp = await AdminApi.getUnivList();
				if(rsp.status === 200) {
					console.log(rsp);
					setUnivNameList(rsp.data);
				}
			} catch (e) {
				console.error(e)
			}
		}
		fetchUniv();
	}, [id]);
	
	useEffect(() => {
		setPage("member");
	}, [setPage]);
	
	const onClickSubmit = async () => {
		{
			const rsp = await AdminApi.editMember(id, univ, authority, member.withdrawal);
			console.log(rsp)
			if(rsp.data) {
				setConfirm({value : true, label: "수정에 성공 했습니다.", onConfirm: () => setConfirm({}), onCancel: () => navigate("/admin/member") })
				return
			}
			setReject("수정에 실패 했습니다.")
		}
	}
	
	const onClickCancel = () => {
		fetchMember()
	}
	
	return(
		<BackGround>
			<MemberItemDetail/>
			<ButtonContainer>
				<Tooltip title="제출하기">
					<IconButton onClick={onClickSubmit}>
						<PublishIcon sx={{color: "green"}}/>
					</IconButton>
				</Tooltip>
				<Tooltip title="취소하기">
					<IconButton onClick={onClickCancel}>
						<CancelIcon sx={{color: 'red'}}/>
					</IconButton>
				</Tooltip>
			</ButtonContainer>
			<ConfirmModal onConfirm={confirm.onConfirm} message={confirm.label} onCancel={confirm.onCancel} open={confirm.value} />
			<RejectModal open={reject} onClose={() => setReject({})} message={reject}/>
		</BackGround>
	)
}

export default MemberItemMain;

const ButtonContainer = styled(Box)`
`