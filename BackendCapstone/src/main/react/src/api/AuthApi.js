import axios from "axios";
import Commons from "../util/Common";
import axiosInstance from "./AxiosInstance";

const baseUrl = "";
const Capstone = Commons.Capstone;

axios.defaults.withCredentials = true;

const AuthApi = {
	sendPw: async (email) => {
		return await axios.post(`${Capstone}/auth/password-reset-requests`, { email });
	},

	login: async (email, pwd) => {
		const data = { email, pwd };
		return await axios.post(`${Capstone}/auth/login`, data);
	},

	emailCheck: async (inputEmail) => {
		const response = await axios.get(`${Capstone}/auth/availability`, {
			params: { email: inputEmail }
		});
		return { ...response, data: response.data.emailAvailable };
	},

	phoneCheck: async (phone) => {
		const response = await axios.get(`${Capstone}/auth/availability`, {
			params: { phone }
		});
		return { ...response, data: response.data.phoneAvailable };
	},

	signup: async (nickname, email, pwd, name, phone, regDate) => {
		const signupData = {
			nickname,
			email,
			pwd,
			name,
			phone,
			regDat: regDate
		};
		return await axios.post(`${Capstone}/auth/signup`, signupData);
	},

	verifySmsToken: async (inputPhone, inputToken) => {
		try {
			const response = await axios.post(`${Capstone}/auth/phone-verifications`, {
				phone: inputPhone,
				inputToken
			});
			return response.data;
		} catch (error) {
			console.error("인증번호 검증 실패", error);
			throw error;
		}
	},

	findPhoneByEmail: async (phone) => {
		const response = await axios.get(`${Capstone}/auth/email`, {
			params: { phone }
		});
		return response.data.email;
	},

	sendVerificationCode: async (phone) => {
		try {
			const response = await axios.post(`${Capstone}/auth/phone-verification-requests`, {
				phone
			});
			return response.data;
		} catch (error) {
			console.error("API 호출 에러:", error);
			throw error;
		}
	},

	nickNameCheck: async (nickname) => {
		try {
			const response = await axios.get(`${Capstone}/auth/availability`, {
				params: { nickname }
			});
			return { ...response, data: response.data.nicknameAvailable };
		} catch (error) {
			console.error("중복체크 실패", error);
			throw error;
		}
	},

	changeNickName: async (inputNickName) => {
		try {
			const token = localStorage.getItem("accessToken");
			return await axios.patch(
				`${Capstone}/members/me/nickname`,
				{ nickname: inputNickName },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);
		} catch (error) {
			console.log("수정 중 오류 발생", error);
			throw error;
		}
	},

	findEmailByPhone: async (phone) => {
		const response = await axios.get(`${Capstone}/auth/email`, {
			params: { phone }
		});
		return response.data.email;
	},

	verifyEmialToken: async (inputEmail, inputCode) => {
		try {
			const response = await axios.post(`${Capstone}/auth/email-verifications`, {
				email: inputEmail,
				inputToken: inputCode
			});
			return response.data;
		} catch (error) {
			console.error("토큰 검증 실패:", error.response?.data || error);
			throw error;
		}
	},

	checkIdMail: async (email) => {
		return await AuthApi.emailCheck(email);
	},

	changePassword: async (newPassword) => {
		try {
			return await axios.patch(`${Capstone}/auth/password`, {
				pwd: newPassword
			});
		} catch (error) {
			if (error.response) {
				throw new Error(error.response.data);
			}
			throw new Error("서버에 연결할 수 없습니다.");
		}
	},

	updatePassword: async (newPassword) => {
		try {
			return await axios.patch(`${Capstone}/members/me/password`, {
				pwd: newPassword
			});
		} catch (error) {
			if (error.response) {
				throw new Error(error.response.data);
			}
			throw new Error("서버에 연결할 수 없습니다.");
		}
	},

	getMemberDetails: async () => {
		try {
			const token = localStorage.getItem("accessToken");
			if (!token) {
				throw new Error("토큰이 존재하지 않습니다.");
			}
			const response = await axiosInstance.get(`${Capstone}/members/me`);
			return response.data;
		} catch (error) {
			console.error("회원 정보 요청 실패:", error.message || error);
			throw error;
		}
	},

	fetchUserData: async (token) => {
		try {
			const response = await axios.get(`${Capstone}/members/me/permissions`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			return response.data;
		} catch (error) {
			console.error("사용자 데이터 가져오기 실패:", error);
			throw error;
		}
	},

	getRevenue: async (token) => {
		try {
			const response = await axios.get(`${Capstone}/members/me/revenue`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			return response.data;
		} catch (error) {
			console.error("수익금 가져오기 실패", error);
			throw error;
		}
	},

	saveRevenue: async (profit, token) => {
		try {
			return await axios.post(
				`${Capstone}/members/me/revenue`,
				{ profit },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
		} catch (error) {
			console.error("사용자 데이터 가져오기 실패:", error);
			throw error;
		}
	},

	changeBankInfo: async (memberId, bankName, bankAccount) => {
		try {
			const response = await axios.patch(`${Capstone}/members/${memberId}/bank-account`, {
				bankName,
				bankAccount
			});
			return response.data;
		} catch (error) {
			console.log(error);
			throw error;
		}
	},

	isLogin: async () => {
		return await axiosInstance.get(`${Capstone}/members/me/role`);
	},

	savePermission: async (permissionUrl) => {
		try {
			const token = localStorage.getItem("accessToken");
			return await axios.post(
				`${Capstone}/members/me/permissions`,
				{ permissionUrl },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);
		} catch (error) {
			console.error("파일 업로드 오류:", error);
			throw error;
		}
	},

	getBankList: async () => {
		try {
			const response = await axios.get(`${Capstone}/auth/banks`);
			return response.data;
		} catch (error) {
			console.error("은행 목록을 가져오는 데 실패했습니다:", error.message);
			throw error;
		}
	},

	checkCurrentPassword: async (currentPassword) => {
		try {
			const token = localStorage.getItem("accessToken");
			const response = await axios.post(
				`${Capstone}/members/me/password/verify`,
				{ pwd: currentPassword },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);
			return response.data;
		} catch (error) {
			console.error("에러 발생", error);
			throw error;
		}
	},

	deleteId: () => {
		return axiosInstance.delete(`${baseUrl}/members/me`);
	},

	createRedactionJob: (file) => {
		const formData = new FormData();
		formData.append("file", file);
		return axiosInstance.post(`${baseUrl}/flask/redaction/jobs`, formData, {
			headers: {
				"Content-Type": "multipart/form-data"
			}
		});
	},

	getRedactionJob: (jobId) => {
		return axiosInstance.get(`${baseUrl}/flask/redaction/jobs/${jobId}`);
	},

	applyRedactionJob: (jobId, payload) => {
		return axiosInstance.post(`${baseUrl}/flask/redaction/jobs/${jobId}/apply`, payload);
	},

	uploadPermission: (formData) => {
		return axiosInstance.post(`${baseUrl}/firebase/upload`, formData, {
			headers: {
				"Content-Type": "multipart/form-data"
			}
		});
	}
};

export default AuthApi;
