import { memo, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import ArrowIcon from "@assets/hubos/move-right.svg?react";

import {
  Link as BtnLink,
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

const TableListItem = memo((data: any) => {
  const { row } = data;
  const theme = useTheme();

  const startDate = useMemo(() => {
    return format(
      new Date(row?.properties?.startDate * 1000),
      "dd.MM.yy"
    ).toString();
  }, [row?.properties?.startDate]);

  const endDate = useMemo(() => {
    return format(
      new Date(row?.properties?.endDate * 1000),
      "dd.MM.yy"
    ).toString();
  }, [row?.properties?.endDate]);

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
          <Typography variant="subtitle2" fontWeight="normal" color="white">
            {row?.name}
          </Typography>
          <Typography variant="caption" fontWeight="normal" color="white">
            {row?.description}
          </Typography>
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
            {row?.contributionType || 'N/A'}
          </Typography>
        </Box>
      </StyledTableCell>
      <StyledTableCell align="left">
        <Typography variant="body" fontWeight="normal" color="white">
          {`${row?.properties?.points} ${row?.properties?.points === 1 ? "pt" : "pts"}`}
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

      {/* <StyledTableCell align="left">
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center"
          }}
        ></Box>
      </StyledTableCell> */}
    </StyledTableRow>
  );
});

export const ContributionsTable = ({ contributions }) => {
  const theme = useTheme();
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
          </TableRow>
        </TableHead>
        {contributions?.length ? (
          <TableBody>
            {contributions?.map((row, index) => (
              <TableListItem key={`table-row-${index}`} row={row} />
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
