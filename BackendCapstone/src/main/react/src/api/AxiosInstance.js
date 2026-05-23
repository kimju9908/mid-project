import axios from "axios";
import store from "../context/Store";
import { logout } from "../context/redux/PersistentReducer";
import Commons from "../util/Common";

const AxiosInstance = axios.create({
  baseURL: ""
});

// ===================== Request 인터셉터 =====================
AxiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = Commons.getAccessToken();
    if (!accessToken) {
      console.warn("🔴 Access Token 없음. 대기 중...");
      const updatedToken = Commons.getAccessToken();
      if (!updatedToken) {
        console.warn("🔴 여전히 Access Token 없음. 요청 취소");
        return Promise.reject(new Error("Access Token 없음"));
      }
      config.headers.Authorization = `Bearer ${updatedToken}`;
    } else {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===================== Response 인터셉터 =====================
AxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorData = error.response?.data; // { status, code, message, errors? }

    // 401: 토큰 만료 → 갱신 시도
    if (status === 401) {
      // INVALID_TOKEN / EXPIRED_TOKEN 이면 재발급 시도
      const refreshToken = Commons.getRefreshToken();
      if (!refreshToken) {
        console.warn("🔴 리프레시 토큰 없음. 로그아웃 처리");
        store.dispatch(logout());
        return Promise.reject(error);
      }
      try {
        const newToken = await Commons.handleUnauthorized();
        if (!newToken) {
          store.dispatch(logout());
          return Promise.reject(error);
        }
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return AxiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    // 403: 권한 없음
    if (status === 403) {
      console.warn("🔴 접근 권한 없음:", errorData?.message);
    }

    // 500: 서버 에러
    if (status === 500) {
      console.error("🔴 서버 오류 발생:", errorData?.message);
    }

    // 에러 객체에 백엔드 응답 데이터를 붙여서 전달
    // 각 컴포넌트에서 error.response.data.code 로 접근 가능
    return Promise.reject(error);
  }
);

export default AxiosInstance;
