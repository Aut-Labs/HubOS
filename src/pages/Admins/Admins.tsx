import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  GridActionsCellItem,
  GridColumns,
  GridEditRowApi,
  GridRenderEditCellParams,
  GridRowApi
} from "@mui/x-data-grid";
import debounce from "lodash.debounce";
import AutDatatable from "@components/datatable/Datatable";
import {
  CustomEditComponent,
  useDatatableApiRef
} from "@components/datatable/DatatableRef";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Container,
  Tooltip,
  Typography,
  useMediaQuery
} from "@mui/material";
import EditToolbar from "@components/datatable/DatatableToolbar";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  GetDatatableItems,
  GetDatatableChangedItems
} from "@components/datatable/DatatableHelpers";
import { ReactComponent as PinIcon } from "@assets/pin.svg";
import { ReactComponent as SaveIcon } from "@assets/actions/confirm.svg";
import { ReactComponent as CancelIcon } from "@assets/actions/cancel.svg";
import { ReactComponent as EditIcon } from "@assets/actions/edit.svg";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@store/store.model";
import { ResultState } from "@store/result-status";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import { pxToRem } from "@utils/text-size";
// import "./Contracts.scss";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import {
  addPAContracts,
  getPAContracts,
  updateAdmins,
  useCanVouchForAFriendQuery,
  useGetCommunityQuery,
  useUpdateAdminsMutation,
  useVouchForAFriendMutation
} from "@api/community.api";
import { getLockedContracts } from "@store/AutDashboard/aut-dashboard.reducer";
import { AutButton } from "@components/buttons";
import AutSDK from "@aut-labs/sdk";
import { AutTextField } from "@theme/field-text-styles";
import { useAccount } from "wagmi";

const tableColumns = (
  getRef: () => MutableRefObject<GridEditRowApi & GridRowApi>
): GridColumns => {
  const handleEditClick = (id) => (event) => {
    event.stopPropagation();
    const apiRef = getRef();
    apiRef.current.setRowMode(id, "edit");
  };

  const handleSaveClick = (id) => (event) => {
    const apiRef = getRef();
    event.stopPropagation();
    apiRef.current.commitRowChange(id);
    apiRef.current.setRowMode(id, "view");

    const row = apiRef.current.getRow(id);
    apiRef.current.updateRows([{ ...row }]);
  };

  const handleDeleteClick = (id) => (event) => {
    const apiRef = getRef();
    event.stopPropagation();
    apiRef.current.setRowMode(id, "view");
    apiRef.current.updateRows([{ id, _action: "delete" }]);
  };
  return [
    {
      headerName: "#",
      field: "id",
      width: 140,
      sortable: false,
      valueGetter: ({ id }) => `${+id + 1}.`
    },
    {
      headerName: "Address",
      field: "address",
      editable: true,
      flex: 1,
      sortable: false,
      cellClassName: "being-edited-cell",
      renderEditCell: (props) => {
        if (props.id !== 0) {
          return CustomEditComponent(props, `Ox...`);
        }
      }
      // renderEditCell: (props) => CustomEditComponent(props, `Ox...`)
      // valueGetter: ({ row: { address } }) => {
      //   debugger;
      //   if (address) {
      //     return `${address}`;
      //   }
      // }
      // valueGetter: ({ row: { address } }) => {
      //   if (address) {
      //     const middle = Math.ceil(address.length / 2);
      //     const left = address.slice(0, middle).substring(0, 8);
      //     let right = address.slice(middle);
      //     right = right.substr(right.length - 8);
      //     return `${left}...${right}`;
      //   }
      // }
    },
    {
      headerName: "Note",
      field: "note",
      editable: true,
      flex: 1,
      sortable: false,
      cellClassName: "being-edited-cell-note",
      renderEditCell: (props) =>
        CustomEditComponent(props, `Enter note here...`)
      // valueGetter: ({ row: { note } }) => {
      //   debugger;
      //   if (note) {
      //     return `${note}`;
      //   }
      // }
    },
    {
      headerName: "",
      field: "actions",
      sortable: false,
      width: 100,
      type: "actions",
      getActions: ({ id }) => {
        const apiRef = getRef();
        const isInEditMode = apiRef.current.getRowMode(id) === "edit";

        if (isInEditMode) {
          if (id === 0) {
            return [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                onClick={handleSaveClick(id)}
                color="primary"
              />
            ];
          }
          return [
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleDeleteClick(id)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
              color="primary"
            />
          ];
        }

        // if (id === 0) return [];

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="secondary"
          />
        ];
      }
    }
  ];
};

const Admins = () => {
  const dispatch = useAppDispatch();
  const { apiRef, columns } = useDatatableApiRef(tableColumns);
  const [initialData, setInitialData] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [open, setOpen] = useState(false);
  const [friendAddress, setFriendAddress] = useState("");
  const { address: userAddress } = useAccount();
  const input = useRef<HTMLElement>();
  const lockedContracts = useSelector(getLockedContracts);
  const { status, errorMessage } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { data, isLoading, isFetching, refetch } = useGetCommunityQuery(null, {
    refetchOnMountOrArgChange: true,
    skip: false
  });

  const { data: canVouchForAFriend, isLoading: isLoadingVoucher } =
    useCanVouchForAFriendQuery(userAddress, {
      refetchOnMountOrArgChange: true,
      skip: false
    });

  console.log(canVouchForAFriend, "canVouchForAFriend");

  const [vouchForAFriend, { error: vouchError, isLoading: vouching }] =
    useVouchForAFriendMutation();

  const [updateAdmins, { error, isLoading: adminsUpdating, isError, reset }] =
    useUpdateAdminsMutation();

  const AdminsMap = useMemo(() => {
    if (data && data.admins) {
      const mapped = data.admins.map((x, i) => {
        return { id: i, address: x.address, note: x.note };
      });
      setInitialData(mapped);
      return mapped;
    }
  }, [data]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleError = () => {
    reset();
  };

  const submit = async () => {
    const state = apiRef?.current?.state;
    if (!state) {
      return;
    }

    const { allItems } = GetDatatableItems(state);
    const { removedItems, updatedItems, noChangedItems, newItems } =
      GetDatatableChangedItems(allItems, initialData);
    const addedAddresses = newItems.map((x) => {
      return { address: x.address, note: x.note };
    });
    const removedAddresses = removedItems.map((x) => {
      return { address: x.address, note: x.note };
    });
    if (!newItems.length && !removedItems.length && !updatedItems.length) {
      setOpen(true);
      return;
    }
    await updateAdmins({
      added: addedAddresses,
      removed: removedAddresses,
      updated: updatedItems,
      initialData
    });
  };

  const debouncedChangeHandler = useMemo(() => {
    const changeHandler = (e) => {
      setFriendAddress(e.target.value);
    };
    return debounce(changeHandler, 10);
  }, []);

  useEffect(() => {
    return () => debouncedChangeHandler.cancel();
  }, [debouncedChangeHandler]);

  return (
    <Container maxWidth="md" className="sw-core-team">
      <LoadingDialog open={adminsUpdating} message="Updating admins..." />
      <ErrorDialog
        open={open}
        handleClose={handleClose}
        message=" No new addresses were added!"
      />
      <ErrorDialog open={isError} handleClose={handleError} message={error} />
      <Typography mt={7} textAlign="center" color="white" variant="h3">
        Admins
      </Typography>
      {isLoading ? (
        <CircularProgress
          className="spinner-center"
          size="60px"
          style={{ top: "calc(50% - 30px)" }}
        />
      ) : (
        <>
          {data && data.admins && (
            <AutDatatable
              apiRef={apiRef}
              columns={columns}
              data={AdminsMap}
              loading={status === ResultState.Loading}
              isCellEditable={(params) => {
                return !params.row.locked;
              }}
              onStateChange={(state) => {
                const { allItems } = GetDatatableItems(state);
                const { noChangedItems, removedItems, updatedItems, newItems } =
                  GetDatatableChangedItems(allItems, initialData, "address");
                const rowsToEdit = Object.keys(state.editRows || {}).length;
                setIsDisabled(
                  rowsToEdit > 0 ||
                    (removedItems.length === 0 &&
                      updatedItems.length === 0 &&
                      newItems.length === 0)
                );
              }}
              components={{
                Toolbar: EditToolbar
              }}
              componentsProps={{
                toolbar: {
                  apiRef,
                  title: "Add new Admin",
                  focusOn: "use",
                  isSaveDisabled: isDisabled,
                  adminsUpdating,
                  onSubmitChanges: submit
                }
              }}
            />
          )}
          <div
            className="sw-table-actions"
            style={{
              display: "flex",
              justifyContent: "center"
            }}
          >
            {/* <Button
              disabled={isDisabled || adminsUpdating}
              sx={{
                height: "50px"
              }}
              type="button"
              color="offWhite"
              variant="outlined"
              size="medium"
              onClick={submit}
            >
              Save changes
            </Button> */}
          </div>

          <Box
            sx={{
              mt: 4,
              gap: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Badge
              badgeContent={
                <Tooltip title="You can vouch for one friend only to be allow listed.">
                  <HelpOutlineIcon
                    color="primary"
                    sx={{ width: "16px", ml: 1 }}
                  />
                </Tooltip>
              }
            >
              <Typography textAlign="center" color="white" variant="subtitle2">
                Vouch for friend:
              </Typography>
            </Badge>

            <AutTextField
              variant="standard"
              color="offWhite"
              disabled={!canVouchForAFriend || isLoadingVoucher || vouching}
              autoFocus
              placeholder="Your friends address"
              inputRef={input}
              onChange={debouncedChangeHandler}
            />

            <Button
              disabled={!canVouchForAFriend || isLoadingVoucher || vouching}
              type="button"
              color="offWhite"
              variant="outlined"
              size="medium"
              onClick={() => vouchForAFriend(friendAddress)}
            >
              Save
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Admins;
