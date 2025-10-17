import AuthApi from "../api/AuthApi";
import {logout, setRole} from "../context/redux/PersistentReducer";
import store from "../context/Store";

export const fetchUserStatus = async () => {
	try{
		const rsp = await AuthApi.isLogin();
		if(rsp)
		{
			console.log(rsp);
			store.dispatch(setRole(rsp.data))
			return
		}
		store.dispatch(logout())
	} catch (error) {
		console.log(error);
	}
}