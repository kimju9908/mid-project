import Commons from "../util/Common";
import AxiosInstance from "./AxiosInstance";

const baseUrl = ""
const token = Commons.getAccessToken()

// 주는거
const AdminApi = {
	getPermissionList: (category) => {
		console.log(`권한 부여 목록 호출 : ${category}`);
		return AxiosInstance.get(baseUrl + `/admin/permission/list/${category}`);
	},
	getPermissionDetails: (permissionId) => {
		console.log(`권한 부여 세부 사항 호출 : ${permissionId}`);
		return AxiosInstance.get(baseUrl + `/admin/permission/details/${permissionId}`);
	},
	activePermission: (permissionId, univId, isUniv) => {
		console.log(`권한 부여 : /admin/permission/active/${permissionId}/${univId}/${isUniv}`);
		return AxiosInstance.post(baseUrl + `/admin/permission/active/${permissionId}/${univId}/${isUniv}`);
	},
	getUnivList: () => {
		console.log("대학 목록 불러오기(대학만)");
		return AxiosInstance.get(baseUrl + `/admin/univ/list`);
	},
	getDeptList: (univName) => {
		console.log(`${univName}의 학과 조회`);
		return AxiosInstance.get(baseUrl + `/admin/dept/list/${univName}`)
	},
	getMemberList: (searchOption, searchValue) => {
		console.log(`${searchOption} 전체 회원 조회 : ${searchValue}`);
		return AxiosInstance.get(baseUrl + `/admin/member/list/${searchValue}/${searchOption}`);
	},
	getMemberDetails: (memberId) => {
		console.log(`${memberId}의 회원 세부 내용 확인`)
		return AxiosInstance.get(baseUrl + `/admin/member/detail/${memberId}`);
	},
	editMember(memberId, univId, authority, withdrawal) {
		console.log(`${memberId}의 정보 변경 : ${univId}-${authority}-${withdrawal}`);
		const member ={
			memberId: memberId,
			authority: authority,
			withdrawal: withdrawal,
			univId: univId,
		}
		return AxiosInstance.post(baseUrl + `/admin/member/edit`, member)
	},
	
	uploadCsv: (file, type) => {
		const formData = new FormData();
		formData.append("file", file);
		
		const config = {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		};
		
		switch (type) {
			case "univ.csv":
				console.log("대학 올리기")
				return AxiosInstance.post(baseUrl + `/admin/csv/univ`, formData, config);
			case "textboard.csv":
				console.log("faq 올리기")
				return AxiosInstance.post(baseUrl + `/admin/csv/textBoard`, formData, config);
			case "bank.csv":
				console.log("은행 올리기")
				return AxiosInstance.post(baseUrl + `/admin/csv/bank`, formData, config);
			default:
				console.log("코딩 에러")
				return null;
		}
	}
}
export default AdminApi;