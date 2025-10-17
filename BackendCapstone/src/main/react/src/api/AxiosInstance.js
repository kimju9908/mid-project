import axios from "axios";
import store from "../context/Store";
import { logout } from "../context/redux/PersistentReducer";
import Commons from "../util/Common";



const AxiosInstance = axios.create({
  baseURL: ""
});

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

AxiosInstance.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401) {
      console.warn("🔴 401 Unauthorized 발생! 토큰 갱신 시도...");
      const refreshToken = Commons.getRefreshToken();
      if (!refreshToken) {
        console.warn("🔴 리프레시 토큰 없음. 로그아웃 처리");
        store.dispatch(logout());
        return Promise.reject(new Error("리프레시 토큰 없음"));
      }
      try {
        const newToken = await Commons.handleUnauthorized();
        if (!newToken) {
          console.warn("🔴 새 토큰 갱신 실패. 로그아웃 처리");
          store.dispatch(logout());
          return Promise.reject(new Error("새 토큰 갱신 실패"));
        }
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return AxiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("🔴 토큰 갱신 중 오류 발생. 로그아웃 처리");
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;
