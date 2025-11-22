import { useState, useEffect, useRef } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box } from "@mui/material";
import AuthApi from "../../../api/AuthApi";
import axios from "axios";
import Commons from "../../../util/Common";

const Permission = () => {
  const [uploadStatus, setUploadStatus] = useState("");
  const [userData, setUserData] = useState([]); // DB에서 가져온 사용자 정보
  const [selectedFile, setSelectedFile] = useState(null); // 선택한 파일
  const fileInputRef = useRef(null); // 파일 선택 input 참조


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const data = await AuthApi.fetchUserData(token); // authApi의 fetchUserData 함수 호출
        setUserData(data); // 데이터 저장
          console.log(data);
      } catch (error) {
        console.error("사용자 데이터 가져오기 실패:", error);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("업로드할 파일을 선택하세요.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("folderPath", "permission");
  
    try {
        const response = await AuthApi.uploadPermission(formData);
  
      if (response.data.message === "File uploaded successfully") {
        setUploadStatus("파일 업로드 성공!");
  
        // 파일 업로드 후 permissionUrl을 생성하여 서버로 보내기
        const permissionUrl = response.data.url; // 서버에서 반환된 URL

  
        // 서버로 permissionReqDto 전송
        const saveResponse = await AuthApi.savePermission(permissionUrl)
        if (saveResponse.data) {
          setUploadStatus("파일과 권한 정보 저장 성공!");
        } else {
          setUploadStatus("파일과 권한 정보 저장 실패.");
        }
      } else {
        setUploadStatus("파일 업로드 실패.");
      }
    } catch (error) {
      setUploadStatus("파일 업로드 중 오류 발생.");
      console.error("파일 업로드 중 오류:", error);
    }
  }



  return (
    <Box sx={{ width: "90%", maxWidth: "1200px", margin: "auto", padding: 5, backgroundColor: "#ffffff" }}>
      {/* 제목 */}
      <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 3 }}>
        파일 업로드 가능 학교 / 학과 정보
      </Typography>

      {/* 테이블 */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#E6E6FA" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>학교명</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>학부 / 학과명</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userData.length > 0 ? (
              userData.map((user, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ textAlign: "center" }}>{user.univName}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{user.univDept}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  아직 증명서를 업로드 하지 않으셨거나 증명서 정보가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" sx={{ marginTop: 3, color: "gray", textAlign: "center" }}>
        합격 증명서를 업로드 하시면 더 많은 자료를 업로드할 수 있습니다. <br />
        관리자 승인 후 파일 업로드 가능하며 승인까지는 최대 3일 소요될 수 있습니다.
      </Typography>


      <Box
        sx={{
          padding: 4,
          textAlign: "center",
          marginTop: 4,
          backgroundColor: "#ffffff",
          cursor: "pointer",
          border: "2px dashed #6A5ACD",
          borderRadius: "8px",
        }}
        onClick={() => fileInputRef.current.click()}
      >
        <Typography sx={{ color: "#6A5ACD", fontWeight: "bold" }}>
          {selectedFile ? selectedFile.name : "여기를 클릭하여 파일을 선택하세요"}
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
          증명서 업로드
        </Button>
      </Box>

      {/* 업로드 상태 메시지 */}
      {uploadStatus && (
        <Typography variant="body2" sx={{ marginTop: 2, textAlign: "center", color: uploadStatus.includes("성공") ? "green" : "red" }}>
          {uploadStatus}
        </Typography>
      )}
    </Box>
  );
};

export default Permission;
