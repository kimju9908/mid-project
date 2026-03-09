import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import AuthApi from "../../../api/AuthApi";

const Permission = () => {
  const [uploadStatus, setUploadStatus] = useState("");
  const [userData, setUserData] = useState([]); // DB에서 가져온 사용자 정보
  const [selectedFile, setSelectedFile] = useState(null); // 선택한 파일
  const [jobInfo, setJobInfo] = useState(null);
  const [boxSelections, setBoxSelections] = useState({});
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const fileInputRef = useRef(null); // 파일 선택 input 참조

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

  useEffect(() => {
    fetchData();
  }, []);

  const resetPermissionPageState = () => {
    setSelectedFile(null);
    setJobInfo(null);
    setBoxSelections({});
    setUploadStatus("");
    setIsPreviewModalOpen(false);
    setIsApplying(false);
    setIsPreviewLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setJobInfo(null);
    setBoxSelections({});
    setUploadStatus("");
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      setUploadStatus("업로드할 파일을 선택하세요.");
      return;
    }

    setIsPreviewLoading(true);
    try {
      const response = await AuthApi.createRedactionJob(selectedFile);
      const data = response.data;

      setJobInfo(data);
      const initialSelections = {};
      (data.detectedBoxes || []).forEach((_, index) => {
        initialSelections[index] = true;
      });
      setBoxSelections(initialSelections);
      setIsPreviewModalOpen(true);

      setUploadStatus("자동 탐지가 완료되었습니다. 박스를 확인 후 최종 업로드를 진행하세요.");
    } catch (error) {
      setUploadStatus("미리보기/자동 탐지 생성 중 오류가 발생했습니다.");
      console.error("미리보기 생성 오류:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleToggleBox = (index) => {
    setBoxSelections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleFinalUpload = async () => {
    if (!jobInfo?.jobId) {
      setUploadStatus("먼저 자동 탐지를 실행하세요.");
      return;
    }

    setIsApplying(true);
    try {
      const finalBoxes = (jobInfo.detectedBoxes || []).map((box, index) => ({
        ...box,
        selected: !!boxSelections[index],
      }));

      const applyResponse = await AuthApi.applyRedactionJob(jobInfo.jobId, {
        boxes: finalBoxes,
        folderPath: "permission",
        fileName: `${jobInfo.jobId}_masked.pdf`,
      });

      const maskedPdfUrl = applyResponse.data?.maskedPdfUrl;
      if (!maskedPdfUrl) {
        setUploadStatus("마스킹 파일 URL을 받지 못했습니다.");
        return;
      }

      const saveResponse = await AuthApi.savePermission(maskedPdfUrl);
      if (saveResponse?.data) {
        setUploadStatus("마스킹된 PDF 업로드 및 권한 정보 저장이 완료되었습니다.");
        resetPermissionPageState();
        await fetchData();
      } else {
        setUploadStatus("마스킹 PDF 업로드는 완료됐지만 권한 정보 저장에 실패했습니다.");
      }
    } catch (error) {
      setUploadStatus("최종 레닥션 적용 또는 업로드 중 오류가 발생했습니다.");
      console.error("레닥션 확정 오류:", error);
    } finally {
      setIsApplying(false);
    }
  };

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
          onClick={handlePreview}
          disabled={isPreviewLoading}
        >
          {isPreviewLoading ? "탐지 중..." : "자동 탐지 시작"}
        </Button>
      </Box>

      <Dialog
        open={isPreviewModalOpen}
        onClose={() => {
          if (!isApplying) {
            setIsPreviewModalOpen(false);
          }
        }}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>자동 탐지 결과 검수</DialogTitle>
        <DialogContent dividers>
          {uploadStatus && (
            <Typography
              variant="body2"
              sx={{
                marginBottom: 2,
                color: uploadStatus.includes("완료") || uploadStatus.includes("성공") ? "green" : "red",
              }}
            >
              {uploadStatus}
            </Typography>
          )}
          {jobInfo && (
            <>
              <Typography variant="body2" sx={{ color: "gray", marginBottom: 2 }}>
                상태: {jobInfo.status} / 파이프라인: {jobInfo.pipelineType}
              </Typography>

              {(jobInfo.previewImages || []).map((preview) => (
                <Box key={`preview-${preview.pageIndex}`} sx={{ marginBottom: 2 }}>
                  <Typography variant="body2" sx={{ marginBottom: 1 }}>
                    페이지 {preview.pageIndex + 1}
                  </Typography>
                  {preview.imageUrl && (
                    <img
                      src={preview.imageUrl}
                      alt={`preview-${preview.pageIndex}`}
                      style={{ width: "100%", maxWidth: "900px", borderRadius: "8px", border: "1px solid #ddd" }}
                    />
                  )}
                </Box>
              ))}

              {(jobInfo.detectedBoxes || []).map((box, index) => (
                <FormControlLabel
                  key={`box-${index}`}
                  control={<Checkbox checked={!!boxSelections[index]} onChange={() => handleToggleBox(index)} />}
                  label={`[${box.reason}] page=${box.pageIndex + 1}, bbox=${JSON.stringify(box.bbox)}`}
                />
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPreviewModalOpen(false)} disabled={isApplying}>
            닫기
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#5A4ACD",
              color: "#fff",
              fontWeight: "bold",
              padding: "12px 24px",
              fontSize: "16px",
              borderRadius: "6px",
              "&:hover": { backgroundColor: "#4638c5" },
            }}
            onClick={handleFinalUpload}
            disabled={isApplying}
          >
            {isApplying ? "최종 처리 중..." : "최종 마스킹 업로드"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Permission;
