import { memo, useMemo } from "react";
import Box from "@mui/material/Box";
import ArrowIcon from "@assets/hubos/move-right.svg?react";

import {
  Alert,
  AlertTitle,
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
import { format, min } from "date-fns";
import { AutOsButton } from "@components/buttons";
import { TaskContributionNFT } from "@aut-labs/sdk";
import {
  ContributionCommit,
  ContributionStatus,
  ContributionStatusMap
} from "@hooks/useQueryContributionCommits";
import OverflowTooltip from "@components/OverflowTooltip";
import { autUrls } from "@api/environment";
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
  onGiveSubmission: (contribution: TaskContributionNFT, submission: ContributionCommit) => void;
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
    onGiveSubmission: (contribution: TaskContributionNFT, submission: ContributionCommit) => void;
  }) => {
    const theme = useTheme();

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
              View Profile
            </Typography>
          </AutOsButton>
        </StyledTableCell>
        <StyledTableCell align="left">
          <Typography variant="body" fontWeight="normal" color="white">
            {`${submission.points} ${submission.points === 1 ? "pt" : "pts"}`}
          </Typography>
        </StyledTableCell>

        <StyledTableCell align="left">
          <Alert
            sx={{
              borderRadius: "8px",
              border: 0,
              height: "40px",
              width: "134px",
              display: "flex",
              alignItems: "center",
              ".MuiAlert-message": {
                overflow: "hidden"
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
              // onViewSubmissions={() => onViewSubmissions(contribution)}
            >
              <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
                View
              </Typography>
            </AutOsButton>
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
              <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
                Give Contribution
              </Typography>
            </AutOsButton>
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
            <StyledTableCell align="left">
              <Typography
                variant="body"
                fontWeight="normal"
                color="offWhite.dark"
              >
                Status
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="left">
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
  );
};
