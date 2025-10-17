import { BackGround } from "../../styles/GlobalStyle";
import {useContext, useEffect} from "react";
import UploaderComponent from "./UploaderComponent";
import {PermissionContext} from "../../context/admin/PermissionStore";

const AdminMain = () => {
	const typeList = ["univ.csv", "textboard.csv", "bank.csv"]
	const { setPage } = useContext(PermissionContext);
	
	useEffect(() => {
		setPage("main");
	}, []);
	
	return (
		<BackGround>
			{typeList.map((type, index) => (
				<UploaderComponent type={type} key={index} />
				))}
		</BackGround>
	);
};

export default AdminMain;
