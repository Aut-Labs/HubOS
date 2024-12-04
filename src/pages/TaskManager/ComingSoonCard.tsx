import { TaskType } from "@api/models/task-type";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import { memo } from "react"; 

interface ComingSoonCardProps {
  taskType: TaskType;
  isFetching: boolean;
}

export const ComingSoonCard = memo(
  ({ taskType, isFetching }: ComingSoonCardProps) => {
    const theme = useTheme();

    return (
      <Box
        sx={{
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "6px",
            zIndex: 1
          }
        }}
      >
        <Box
          sx={{
            alignItems: "flex-start",
            justifyContent: "flex-start",
            backdropFilter: "blur(50px)",
            backgroundColor: "rgba(128, 128, 128, 0.05)",
            border: `1px solid ${theme.palette.offWhite.dark}`,
            borderRadius: "6px",
            opacity: 1,
            WebkitBackdropFilter: "blur(6px)",
            padding: {
              xs: "24px 24px",
              md: "20px 20px",
              xxl: "36px 32px"
            },
            display: "flex",
            flexDirection: "column",
            animation: "none"
          }}
        >
          <Stack direction="column" justifyContent="center" display="flex">
            <Box
              style={{
                flex: "2",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}
            >
              <Typography
                color="offWhite.main"
                textAlign="center"
                lineHeight={1}
                variant="subtitle2"
              >
                {taskType?.metadata?.properties?.title || "Coming Soon"}
              </Typography>
            </Box>
          </Stack>
          <Stack sx={{ mt: 2, mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: "offWhite.main",
                opacity: 0.8,
                fontWeight: "400",
                letterSpacing: "0.66px"
              }}
            >
              {taskType?.metadata?.properties?.shortDescription ||
                "This module is currently in development. Stay tuned for exciting new features and capabilities coming to this space."}
            </Typography>
            <Box
              component="button"
              disabled
              sx={{
                mt: 2,
                py: 1.5,
                px: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${theme.palette.offWhite.dark}`,
                borderRadius: "4px",
                backgroundColor: "transparent",
                cursor: "not-allowed",
                opacity: 0.7,
                transition: "all 0.2s",
                width: "100%"
              }}
            >
              <Typography
                fontWeight="bold"
                fontSize="16px"
                lineHeight="26px"
                color="offWhite.main"
              >
                Coming Soon
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }
);

export default ComingSoonCard;
