/* eslint-disable max-len */
import { useGetAllOnboardingQuestsQuery } from "@api/onboarding.api";
import { PluginDefinition } from "@aut-labs-private/sdk";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  CircularProgress,
  IconButton,
  Tooltip
} from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { memo, useMemo, useState } from "react";

import LoadingProgressBar from "@components/LoadingProgressBar";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  QuestFilters,
  QuestListItem,
  QuestStyledTableCell
} from "./QuestShared";

interface PluginParams {
  plugin: PluginDefinition;
}

const Quests = ({ plugin }: PluginParams) => {
  const [search, setSearchState] = useState(null);
  const {
    data: quests,
    isLoading,
    isFetching,
    refetch
  } = useGetAllOnboardingQuestsQuery(plugin.pluginAddress, {
    refetchOnMountOrArgChange: false,
    skip: false
  });

  const filteredQuests = useMemo(() => {
    if (!search) return quests;
    return quests?.filter(
      (q) =>
        (q?.metadata?.name || "")
          ?.toLowerCase()
          ?.includes(search?.title?.toLowerCase()) &&
        (!search.role || q.role === search.role)
    );
  }, [quests, search]);

  return (
    <Container maxWidth="lg" sx={{ py: "20px" }}>
      <LoadingProgressBar isLoading={isFetching} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          position: "relative"
        }}
      >
        <Typography textAlign="center" color="white" variant="h3">
          Onboarding quests
          <Tooltip title="Refresh quests">
            <IconButton
              size="medium"
              color="offWhite"
              sx={{
                ml: 1
              }}
              disabled={isLoading || isFetching}
              onClick={refetch}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Typography>
        {!!quests?.length && (
          <Box
            sx={{
              display: "flex",
              mt: 4,
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <QuestFilters searchCallback={setSearchState} />
            <Stack direction="row" gap={2}>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="medium"
                color="primary"
                to={`create`}
                component={Link}
              >
                Create quest
              </Button>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="medium"
                color="primary"
                to={`create`}
                component={Link}
              >
                Activate onboarding
              </Button>
            </Stack>
          </Box>
        )}
      </Box>

      {!isLoading && !quests?.length && (
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            mt: 12,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Typography color="rgb(107, 114, 128)" variant="subtitle2">
            You have not created any onboarding quest...
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="medium"
            color="offWhite"
            to={`create`}
            component={Link}
          >
            Create you first quest
          </Button>
        </Box>
      )}

      {!isLoading && !!quests?.length && !filteredQuests?.length && (
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            mt: 12,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Typography color="rgb(107, 114, 128)" variant="subtitle2">
            No quests found!
          </Typography>
        </Box>
      )}

      {isLoading ? (
        <CircularProgress className="spinner-center" size="60px" />
      ) : (
        <>
          {!!filteredQuests?.length && (
            <TableContainer
              sx={{
                borderRadius: "16px",
                backgroundColor: "nightBlack.main",
                borderColor: "divider",
                mt: 4
              }}
              component={Paper}
            >
              <Table
                sx={{
                  ".MuiTableBody-root > .MuiTableRow-root:hover": {
                    backgroundColor: "#ffffff0a"
                  }
                }}
              >
                <TableHead>
                  <TableRow>
                    <QuestStyledTableCell>Name</QuestStyledTableCell>
                    <QuestStyledTableCell align="right">
                      Role
                    </QuestStyledTableCell>
                    <QuestStyledTableCell align="right">
                      Submissions
                    </QuestStyledTableCell>
                    <QuestStyledTableCell align="right">
                      Duration
                    </QuestStyledTableCell>
                    <QuestStyledTableCell align="right">
                      Status
                    </QuestStyledTableCell>
                    <QuestStyledTableCell align="right">
                      Action
                    </QuestStyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredQuests?.map((row, index) => (
                    <QuestListItem key={`table-row-${index}`} row={row} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Container>
  );
};

export default memo(Quests);
