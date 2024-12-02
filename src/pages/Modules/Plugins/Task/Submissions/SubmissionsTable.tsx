import { memo, useMemo } from "react";
import Box from "@mui/material/Box";
import ArrowIcon from "@assets/hubos/move-right.svg?react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

import {
  Alert,
  AlertTitle,
  Button,
  Container,
  Paper,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
  useTheme
} from "@mui/material";
import { format, min, set } from "date-fns";
import { AutOsButton } from "@components/buttons";
import { TaskContributionNFT } from "@aut-labs/sdk";
import {
  ContributionCommit,
  ContributionStatus,
  ContributionStatusMap
} from "@hooks/useQueryContributionCommits";
import OverflowTooltip from "@components/OverflowTooltip";
import { autUrls } from "@api/environment";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedSubmission } from "@store/Contributions/contributions.reducer";
const urls = autUrls();

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}, &.${tableCellClasses.body}`]: {
    color: theme.palette.common.white,
    borderColor: "#576176",
    padding: theme.spacing(2),
    "&:nth-of-type(3)": {
      padding: `${theme.spacing(2)} 0 ${theme.spacing(2)} ${theme.spacing(2)}`
    },
    "&:nth-of-type(4)": {
      padding: `${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)} 0`
    }
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:last-child td, &:last-child th": {
    border: 0
  }
}));

export interface ContributionTableProps {
  selectedContribution: TaskContributionNFT;
  onGiveSubmission: (
    contribution: TaskContributionNFT,
    submission: ContributionCommit
  ) => void;
  contributionsWithSubmissions: {
    contribution: TaskContributionNFT & { contributionType?: string };
    submissions: ContributionCommit[];
  }[];
}

const TableListItem = memo(
  ({
    contribution,
    submission,
    onGiveSubmission
  }: {
    contribution: TaskContributionNFT & { contributionType?: string };
    submission: ContributionCommit;
    onGiveSubmission: (
      contribution: TaskContributionNFT,
      submission: ContributionCommit
    ) => void;
  }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const status = useMemo(() => {
      let severity = "warning";
      if (submission.status === ContributionStatus.Rejected) {
        severity = "error";
      } else if (submission.status === ContributionStatus.Complete) {
        severity = "success";
      }

      return {
        state: ContributionStatusMap[submission.status],
        severity
      };
    }, [submission.status]);

    const onViewSubmissions = () => {
      dispatch(setSelectedSubmission(submission));
      navigate({
        pathname: `${submission?.id}`
      });
    };

    return (
      <StyledTableRow
        sx={{
          "&:last-child td, &:last-child th": { border: 0 },
          "td, th": {
            padding: theme.spacing(2),
            width: "15%",
            "&:nth-of-type(1)": {
              width: "40%"
            }
          }
        }}
      >
        <StyledTableCell align="left">
          <Stack>
            <OverflowTooltip
              typography={{
                variant: "subtitle2",
                fontWeight: "400",
                letterSpacing: "0.66px"
              }}
              maxLine={1}
              text={contribution?.name}
            />
            <OverflowTooltip
              typography={{
                variant: "caption",
                fontWeight: "400",
                letterSpacing: "0.66px"
              }}
              maxLine={2}
              text={contribution?.description}
            />
          </Stack>
        </StyledTableCell>
        <StyledTableCell align="left">
          <AutOsButton
            target="_blank"
            href={`${urls.myAut}${submission.who}`}
            type="button"
            variant="contained"
          >
            <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
              Go to Profile
            </Typography>
          </AutOsButton>
        </StyledTableCell>
        <StyledTableCell align="left">
          <Typography variant="body" fontWeight="normal" color="white">
            {`${contribution?.properties?.points} ${contribution?.properties?.points === 1 ? "pt" : "pts"}`}
          </Typography>
        </StyledTableCell>

        <StyledTableCell align="left">
          <Alert
            variant="filled"
            sx={{
              borderRadius: "8px",
              border: 0,
              height: "40px",
              width: "134px",
              display: "flex",
              color: "white",
              fontFamily: "FractulRegular",
              fontWeight: "bold",
              alignItems: "center",
              ".MuiAlert-message": {
                overflow: "hidden"
              },
              ".MuiAlert-icon": {
                marginRight: theme.spacing(1)
              }
            }}
            severity={status?.severity as any}
          >
            {status?.state}
          </Alert>
        </StyledTableCell>

        <StyledTableCell align="left">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gridGap: 4
            }}
          >
            <AutOsButton
              type="button"
              variant="contained"
              sx={{
                "&.MuiButton-root": {
                  minWidth: "160px",
                  width: "160px"
                }
              }}
              onClick={() => onViewSubmissions()}
            >
              <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
                View
              </Typography>
            </AutOsButton>
            <>
              {submission.status === ContributionStatus.Pending && (
                <AutOsButton
                  type="button"
                  variant="contained"
                  disabled={submission.status !== ContributionStatus.Pending}
                  sx={{
                    "&.MuiButton-root": {
                      minWidth: "160px",
                      width: "160px"
                    }
                  }}
                  onClick={() => onGiveSubmission(contribution, submission)}
                >
                  <Typography
                    fontWeight="bold"
                    fontSize="16px"
                    lineHeight="26px"
                  >
                    Give Contribution
                  </Typography>
                </AutOsButton>
              )}
            </>
          </Box>
        </StyledTableCell>
      </StyledTableRow>
    );
  }
);

export const SubmissionsTable = ({
  contributionsWithSubmissions,
  selectedContribution,
  onGiveSubmission
}: ContributionTableProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const submissions = useMemo(() => {
    if (selectedContribution) {
      return contributionsWithSubmissions.find(
        (contribution) =>
          contribution.contribution.properties.id ===
          selectedContribution.properties.id
      )?.submissions;
    }
    return contributionsWithSubmissions.reduce(
      (acc, { submissions }) => [...acc, ...submissions],
      []
    );
  }, [contributionsWithSubmissions, selectedContribution]);

  return (
    <>
      <Container maxWidth="md">
        <Box
          sx={{
            my: theme.spacing(4),
          }}
        >
          <Stack alignItems="start" justifyContent="center">
            <Button
              startIcon={<ArrowBackIosNewIcon />}
              color="offWhite"
              sx={{
                left: 0
              }}
              onClick={() => navigate(-1)}
            >
              <Typography color="white" variant="body">
                Back
              </Typography>
            </Button>
          </Stack>
          <Stack alignItems="start" justifyContent="start" flexDirection="row" gap={1}>
            <Typography variant="h3" color="white">
              Submissions
            </Typography>
            <Typography variant="h3" color="white">
           {
              `(${submissions?.length}/${selectedContribution?.properties?.quantity})`
           }
            </Typography>
          </Stack>

          <TableContainer
            sx={{
              minWidth: {
                sm: "100%"
              },
              width: {
                xs: "100%",
                sm: "unset"
              },
              margin: 0,
              mt: theme.spacing(4),
              padding: 0,
              backgroundColor: "transparent",
              borderColor: "#576176"
            }}
            component={Paper}
          >
            <Table
              className="swiper-no-swiping"
              sx={{
                minWidth: {
                  xs: "700px",
                  sm: "unset"
                },
                ".MuiTableBody-root > .MuiTableRow-root:hover": {
                  backgroundColor: "#ffffff0a"
                }
              }}
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell align="left">
                    <Typography
                      variant="body"
                      fontWeight="normal"
                      color="offWhite.dark"
                    >
                      Name
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    <Typography
                      variant="body"
                      fontWeight="normal"
                      color="offWhite.dark"
                    >
                      Member
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    <Typography
                      variant="body"
                      fontWeight="normal"
                      color="offWhite.dark"
                    >
                      Points
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography
                      variant="body"
                      fontWeight="normal"
                      color="offWhite.dark"
                    >
                      Status
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography
                      variant="body"
                      fontWeight="normal"
                      color="offWhite.dark"
                    ></Typography>
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              {submissions?.length ? (
                <TableBody>
                  {submissions?.map((row, index) => (
                    <TableListItem
                      key={`table-row-${index}`}
                      contribution={selectedContribution}
                      submission={row}
                      onGiveSubmission={onGiveSubmission}
                    />
                  ))}
                </TableBody>
              ) : (
                <Box
                  sx={{
                    padding: theme.spacing(2)
                  }}
                >
                  <Typography variant="body" color="white">
                    No items found...
                  </Typography>
                </Box>
              )}
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </>
  );
};
