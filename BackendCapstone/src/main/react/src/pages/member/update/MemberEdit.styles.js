import { styled } from "@mui/material/styles";
import { Button, Box } from "@mui/material";

// Primary Action Button - Main actions like "수정", "변경"
export const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#5f53d3",
  color: "#fff",
  borderRadius: "12px",
  padding: "12px 24px",
  fontSize: "14px",
  fontWeight: 600,
  textTransform: "none",
  boxShadow: "0 2px 8px rgba(95, 83, 211, 0.2)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "#4a3fb5",
    boxShadow: "0 4px 12px rgba(95, 83, 211, 0.3)",
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0)",
    boxShadow: "0 2px 8px rgba(95, 83, 211, 0.2)",
  },
  "&:disabled": {
    backgroundColor: "#e0e0e0",
    color: "#9e9e9e",
    boxShadow: "none",
    transform: "none",
  },
}));

// Secondary Action Button - Less prominent actions
export const SecondaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: "transparent",
  color: "#5f53d3",
  border: "2px solid #5f53d3",
  borderRadius: "12px",
  padding: "10px 22px",
  fontSize: "14px",
  fontWeight: 600,
  textTransform: "none",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "#5f53d3",
    color: "#fff",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(95, 83, 211, 0.2)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
  "&:disabled": {
    borderColor: "#e0e0e0",
    color: "#9e9e9e",
    transform: "none",
  },
}));

// Danger Button - For destructive actions
export const DangerButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#f44336",
  color: "#fff",
  borderRadius: "12px",
  padding: "12px 24px",
  fontSize: "14px",
  fontWeight: 600,
  textTransform: "none",
  boxShadow: "0 2px 8px rgba(244, 67, 54, 0.2)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "#d32f2f",
    boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0)",
    boxShadow: "0 2px 8px rgba(244, 67, 54, 0.2)",
  },
  "&:disabled": {
    backgroundColor: "#e0e0e0",
    color: "#9e9e9e",
    boxShadow: "none",
    transform: "none",
  },
}));

// Button Container for consistent spacing
export const ButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: "12px",
  alignItems: "center",
  justifyContent: "flex-end",
  marginTop: "16px",
}));

// Full Width Button Variants
export const FullWidthPrimaryButton = styled(PrimaryButton)({
  width: "100%",
  height: "48px",
});

export const FullWidthSecondaryButton = styled(SecondaryButton)({
  width: "100%",
  height: "48px",
});

// Modal Button Container
export const ModalButtonContainer = styled(Box)({
  display: "flex",
  gap: "12px",
  justifyContent: "center",
  marginTop: "24px",
});

// Responsive Button Sizes
export const SmallButton = styled(PrimaryButton)({
  padding: "8px 16px",
  fontSize: "12px",
  height: "36px",
});

export const LargeButton = styled(PrimaryButton)({
  padding: "16px 32px",
  fontSize: "16px",
  height: "56px",
});

// Icon Button Style
export const IconButton = styled(Button)({
  minWidth: "auto",
  padding: "8px",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "rgba(95, 83, 211, 0.1)",
  },
});
