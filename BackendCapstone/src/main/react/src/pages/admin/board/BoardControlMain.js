import TextStore from "../../../context/TextStore";
import BoardCategorySelector from "./BoardCategorySelector";
import {BackGround} from "../../../styles/GlobalStyle";
import PostListMain from "../../text/post/list/PostListMain";
import {useContext, useEffect} from "react";
import {PermissionContext} from "../../../context/admin/PermissionStore";


const BoardControlMain = () => {
	
	const {setPage} = useContext(PermissionContext);
	
	useEffect(() => {
		setPage("board")
	},[])
	
	
	return(
		<BackGround>
			<BoardCategorySelector/>
			<TextStore>
				<PostListMain active="INACTIVE" />
			</TextStore>
		</BackGround>
	)
}

export default BoardControlMain;