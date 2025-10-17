import axios from "axios";
import Commons from "../util/Common";
import AxiosInstance from "./AxiosInstance";


const baseUrl = Commons.Capstone

const TextBoardApi = {
	// 카테고리별 모든 글을 가져오는 API (페이지네이션 포함)
	getAllTextBoardPage: async (category, size, active) => {
		console.log(`카테고리 ${category}, 활성화 상태 ${active}에 대한 전체 검색 페이지당 게시글 수 : ${size}`);
		return await axios.get(baseUrl + `/board/public/page/${category}`, { params: { size, active } });
	},
	getAllTextBoardList: async (category, page, size, active, sort) => {
		console.log(`카테고리 ${category}, 활성화 상태 ${active}, 정렬 기준 ${sort} 에 대한 전체 조회 페이지 : ${page}, 페이지당 게시글 수 : ${size}`);
		return await axios.get(baseUrl + `/board/public/find/${category}`, { params: { page, size, active, sort } });
	},
	
	// 제목 검색 추가
	getAllTextBoardPageByTitle: async (title, category, size, active) => {
		console.log(`카테고리 ${category}, 활성화 상태 ${active}에 대한 제목 : ${title} 검색 페이지당 게시글 수 : ${size}`);
		return await axios.get(baseUrl + `/board/public/page/title/${category}/${title}`, { params: { size, active } });
	},
	getAllTextBoardListByTitle: async (title, category, page, size, active, sort) => {
		console.log(`카테고리 ${category}, 활성화 상태 ${active}, 정렬 기준 ${sort} 에 대한 제목 : ${title} 검색 페이지 : ${page}, 페이지당 게시글 수 : ${size}`);
		return await axios.get(baseUrl + `/board/public/find/title/${category}/${title}`, { params: { page, size, active, sort } });
	},
	
	// 닉네임 검색 추가
	getAllTextBoardPageByNickName: async (nickName, category, size, active) => {
		console.log(`카테고리 ${category}, 활성화 상태 ${active} 에 대한 닉네임 : ${nickName} 검색 페이지당 게시글 수 : ${size}`);
		return await axios.get(baseUrl + `/board/public/page/nickName/${category}/${nickName}`, { params: { size, active } });
	},
	getAllTextBoardListByNickName: async (nickName, category, page, size, active, sort) => {
		console.log(`카테고리 ${category}, 활성화 상태 ${active}, 정렬 기준 ${sort} 에 대한 닉네임 : ${nickName} 검색 페이지 : ${page}, 페이지당 게시글 수 : ${size}`);
		return await axios.get(baseUrl + `/board/public/find/nickName/${category}/${nickName}`, { params: { page, size, active, sort } });
	},
	
	// 제목 및 내용 검색 추가
	getAllTextBoardPageByTitleOrContent: async (keyword, category, size, active) => {
		console.log(`카테고리 ${category}, 활성화 상태 ${active} 에 대한 제목 및 내용 : ${keyword} 검색 페이지당 게시글 수 : ${size}`);
		return await axios.get(baseUrl + `/board/public/page/titleOrContent/${category}/${keyword}`, { params: { size, active } });
	},
	getAllTextBoardListByTitleOrContent: async (keyword, category, page, size, active, sort) => {
		console.log(`카테고리 ${category}, 활성화 상태 ${active}, 정렬 기준 ${sort} 에 대한 제목 및 내용 : ${keyword} 검색 페이지 : ${page}, 페이지당 게시글 수 : ${size}`);
		return await axios.get(baseUrl + `/board/public/find/titleOrContent/${category}/${keyword}`, { params: { page, size, active, sort } });
	},
	
	// 작성자 검색 추가
	getAllTextBoardPageByMember: async (email, category, size, active) => {
		console.log(`카테고리 ${category}, 활성화 상태 ${active} 에 대한 회원 : ${email} 검색 페이지당 게시글 수 : ${size}`);
		return await axios.get(baseUrl + `/board/public/page/member/${category}/${email}`, { params: { size, active } });
	},
	getAllTextBoardListByMember: async (email, category, page, size, active, sort) => {
		console.log(`카테고리 ${category}, 활성화 상태 ${active}, 정렬 기준 ${sort} 에 대한 회원 : ${email} 검색 페이지 : ${page}, 페이지당 게시글 수 : ${size}`);
		return await axios.get(baseUrl + `/board/public/find/member/${category}/${email}`, { params: { page, size, active, sort } });
	},
	
	// 글 작성을 위한 api
	createTextBoard : async (title, content, category) => {
		const token = localStorage.getItem("accessToken");
		const req = {
			title: title,
			content: content,
			textCategory: category,
		}
		console.log(`글 작성을 위한 api : ${JSON.stringify(req)}`)
		return await AxiosInstance.post(baseUrl + "/board/create", (req), )
	},
	
	// 글 수정을 위한 api
	updateTextBoard : async (title, content, category, boardId) => {
		const token = localStorage.getItem("accessToken");
		const req = {
			title: title,
			content: content,
			textCategory: category,
			textId: boardId,
		}
		console.log(`글번호 : ${boardId}를 위한 글 수정을 위한 api : ${JSON.stringify(req)}`)
		return await AxiosInstance.post(baseUrl + `/board/update`, req)
	},
	
	// 글 삭제를 위한 api
	deleteTextBoard: async (boardId) => {
		const token = localStorage.getItem("accessToken");
		console.log(`글번호 : ${boardId}를 위한 글 삭제을 위한 api`)
		return await  AxiosInstance.delete(baseUrl + `/board/delete/${boardId}/`, )
	},
	
	detailTextBoard: async (boardId) => {
		console.log(`\`글번호 : ${boardId}를 위한 글 조회를 위한 api 요청자`)
		return await  axios.get(baseUrl + `/board/public/find/id/${boardId}`,
		)
	},
	detailTextBoardForEdit : async (boardId) => {
		const token = localStorage.getItem("accessToken");
		console.log(`글번호 : ${boardId}를 위한 글 수정을 위해 받아오는 api 요청자`)
		return await  AxiosInstance.get(baseUrl + `/board/load/id/${boardId}`)
	},
	isAuthor: async (boardId) => {
		const token = localStorage.getItem("accessToken");
		console.log(`글번호 : ${boardId}의 작성자인지 확인하는 메서드`)
		return await AxiosInstance.get(baseUrl + `/board/isAuthor/${boardId}`)
	},
	
	getComments: async (boardId, page, size, isLoggedIn) => {
		const url = isLoggedIn
			? `${baseUrl}/board/list/comment/${boardId}`
			: `${baseUrl}/board/list/comment/public/${boardId}`; // 비로그인 유저용 API
		
		const axiosSel = isLoggedIn ? axios : AxiosInstance
		console.log(`글번호 : ${boardId}의 댓글 리스트 조회 ${page}-${size}`);
		return await axiosSel.get(url, {
			params: { page, size },
		});
	},
	
	
	getMaxPage: async (boardId, size) => {
		console.log(`글번호 : ${boardId}의 댓글 최대 값 조회 ${size}`)
		return await axios.get(baseUrl + `/board/page/comment/${boardId}`,
			{params: {size},})
	},
	
	createComment: async (boardId, content) => {
		const token = localStorage.getItem("accessToken");
		console.log(`글번호 : ${boardId}의 댓글 작성 : ${content}`)
		const comment = {
			content: content,
			boardId: boardId,
		}
		return await AxiosInstance.post(baseUrl + `/board/create/comment`, comment)
	},
	updateComment: async (boardId, commentId, content) => {
		const token = localStorage.getItem("accessToken");
		console.log(`글번호 : ${boardId} 의 댓글번호 : ${commentId} 수정 : ${content}`)
		const comment = {
			content: content,
			boardId: boardId,
			commentId: commentId,
		}
		return await AxiosInstance.post(baseUrl + `/board/update/comment`, comment)
	},
	
	deleteComment: async (boardId, commentId) => {
		const comment = {
			commentId: commentId,
			boardId: boardId,
		}
		console.log(`글번호 : ${boardId} 의 댓글번호 : ${commentId} 삭제`)
		return await AxiosInstance.post(baseUrl + `/board/delete/comment`, comment)
	},
	getAuthor: async (id) => {
		return await axios.get(baseUrl + `/board/public/author/${id}`)
	}
}

export default TextBoardApi