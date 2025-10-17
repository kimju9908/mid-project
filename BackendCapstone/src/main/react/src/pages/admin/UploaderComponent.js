import { BackGround } from "../../styles/GlobalStyle";
import { Box, Button, Typography } from "@mui/material";
import { useRef, useState } from "react";
import AdminApi from "../../api/AdminApi";
import RejectModal from "../../component/Modal/RejectModal";


const UploaderComponent = ({type}) => {
	const [reject, setReject] = useState("");
	const [selectedFile, setSelectedFile] = useState(null); // 선택한 파일
	const fileInputRef = useRef(null); // 파일 선택 input 참조
	
	// 🔹 파일 업로드 API
	const handleUpload = async () => {
		console.log(selectedFile);
		if (!selectedFile) {
			setReject("파일을 올리고 클릭해 주세요");
			return;
		}
		try {
			const rsp = await AdminApi.uploadCsv(selectedFile, type);
			console.log(rsp)
		} catch (error) {
			setReject("파일 업로드 중 오류 발생.");
			console.error("파일 업로드 중 오류:", error);
		}
	};
	
	// 🔹 드래그된 파일 처리
	const handleFileDrop = (e) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file) {
			setSelectedFile(file);
		}
	};
	
	// 🔹 드래그 오버 상태 처리
	const handleDragOver = (e) => {
		e.preventDefault();
	};
	
	// 🔹 파일 선택 변경 처리
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setSelectedFile(file);
		}
	};
	
	return (
		<BackGround>
			<Typography variant="h3" sx={{marginTop: "50px"}}>{type}</Typography>
			<Box
				sx={{
					padding: 4,
					textAlign: "center",
					marginTop: 4,
					backgroundColor: "#ffffff",
					cursor: "pointer",
					border: "2px dashed #6A5ACD",
					borderRadius: "8px",
					transition: "border 0.2s",
					"&:hover": {
						border: "2px dashed #5A4ACD",
					},
				}}
				onClick={() => fileInputRef.current.click()}
				onDrop={handleFileDrop} // 드래그된 파일을 받음
				onDragOver={handleDragOver} // 드래그 중 파일을 올려놓을 수 있게 처리
			>
				<Typography sx={{ color: "#6A5ACD", fontWeight: "bold" }}>
					{selectedFile ? selectedFile.name : "여기를 클릭하여 파일을 선택하거나 파일을 드래그해서 넣으세요"}
				</Typography>
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					style={{ display: "none" }}
				/>
			</Box>
			
			{/* 파일 업로드 버튼 */}
			<Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 3 }}>
				<Button
					variant="contained"
					sx={{
						backgroundColor: "#6A5ACD",
						color: "#fff",
						fontWeight: "bold",
						padding: "12px 24px",
						fontSize: "16px",
						borderRadius: "6px",
						"&:hover": { backgroundColor: "#5A4ACD" },
					}}
					onClick={handleUpload}
				>
					{type} 업로드
				</Button>
			</Box>
			<RejectModal open={reject} message={reject} onClose={() => setReject("")}/>
		</BackGround>
	);
};

export default UploaderComponent;
