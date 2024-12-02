import { memo, useMemo } from "react";
import Box from "@mui/material/Box";
import ArrowIcon from "@assets/hubos/move-right.svg?react";

import {
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
import { format } from "date-fns";
import { AutOsButton } from "@components/buttons";
import { Link } from "react-router-dom";
import { TaskContributionNFT } from "@aut-labs/sdk";
import { ContributionCommit } from "@hooks/useQueryContributionCommits";
import OverflowTooltip from "@components/OverflowTooltip";

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
  onViewSubmissions: (contribution: TaskContributionNFT) => void;
  contributionsWithSubmissions: {
    contribution: TaskContributionNFT & { contributionType?: string };
    submissions: ContributionCommit[];
  }[];
}

const TableListItem = memo(
  ({
    contribution,
    submissions,
    onViewSubmissions
  }: {
    contribution: TaskContributionNFT & { contributionType?: string };
    submissions: ContributionCommit[];
    onViewSubmissions: (contribution: TaskContributionNFT) => void;
  }) => {
    const theme = useTheme();

    const startDate = useMemo(() => {
      return format(
        new Date(contribution?.properties?.startDate * 1000),
        "dd.MM.yy"
      ).toString();
    }, [contribution?.properties?.startDate]);

    const endDate = useMemo(() => {
      return format(
        new Date(contribution?.properties?.endDate * 1000),
        "dd.MM.yy"
      ).toString();
    }, [contribution?.properties?.endDate]);

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
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center"
            }}
          >
            <Typography variant="body" fontWeight="normal" color="white">
              {contribution?.contributionType || "N/A"}
            </Typography>
          </Box>
        </StyledTableCell>
        <StyledTableCell align="left">
          <Typography variant="body" fontWeight="normal" color="white">
            {`${contribution?.properties?.points} ${contribution?.properties?.points === 1 ? "pt" : "pts"}`}
          </Typography>
        </StyledTableCell>
        <StyledTableCell align="left">
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center"
            }}
          >
            <Typography variant="body" fontWeight="normal" color="white">
              {startDate}
            </Typography>
            <SvgIcon
              sx={{ fill: "transparent", ml: theme.spacing(4) }}
              component={ArrowIcon}
            />
          </Box>
        </StyledTableCell>
        <StyledTableCell align="left">
          <Typography variant="body" fontWeight="normal" color="white">
            {endDate}
          </Typography>
        </StyledTableCell>

        <StyledTableCell align="left">
          <Typography variant="body" fontWeight="normal" color="white">
            {submissions?.length} / {contribution?.properties?.quantity}
          </Typography>
        </StyledTableCell>

        <StyledTableCell align="left">
          <AutOsButton
            type="button"
            variant="contained"
            onClick={() => onViewSubmissions(contribution)}
            disabled={!submissions?.length}
          >
            <Typography fontWeight="bold" fontSize="16px" lineHeight="26px">
              View
            </Typography>
          </AutOsButton>
        </StyledTableCell>
      </StyledTableRow>
    );
  }
);

export const ContributionsTable = ({
  contributionsWithSubmissions,
  onViewSubmissions
}: ContributionTableProps) => {
  const theme = useTheme();
  return (
    <>
      <Container maxWidth="md">
        <Box
          sx={{
            my: theme.spacing(4)
          }}
        >
          <Typography variant="h3" color="white">
            Contributions
          </Typography>
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
                      Type
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
                      Start Date
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    <Typography
                      variant="body"
                      fontWeight="normal"
                      color="offWhite.dark"
                    >
                      End Date
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    <Typography
                      variant="body"
                      fontWeight="normal"
                      color="offWhite.dark"
                    >
                      Submissions
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
              {contributionsWithSubmissions?.length ? (
                <TableBody>
                  {contributionsWithSubmissions?.map((row, index) => (
                    <TableListItem
                      key={`table-row-${index}`}
                      contribution={row.contribution}
                      submissions={row.submissions}
                      onViewSubmissions={onViewSubmissions}
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
