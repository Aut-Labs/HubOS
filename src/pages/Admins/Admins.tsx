import { MutableRefObject, useEffect, useMemo, useState } from "react";
import {
  GridActionsCellItem,
  GridColumns,
  GridEditRowApi,
  GridRenderEditCellParams,
  GridRowApi
} from "@mui/x-data-grid";
import AutDatatable from "@components/datatable/Datatable";
import {
  CustomEditComponent,
  useDatatableApiRef
} from "@components/datatable/DatatableRef";
import { Button, Container, Typography, useMediaQuery } from "@mui/material";
import EditToolbar from "@components/datatable/DatatableToolbar";
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
  useGetCommunityQuery,
  useUpdateAdminsMutation
} from "@api/community.api";
import { getLockedContracts } from "@store/AutDashboard/aut-dashboard.reducer";
import { AutButton } from "@components/buttons";
import AutSDK from "@aut-labs-private/sdk";

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
    apiRef.current.updateRows([{ ...row, isNew: false }]);
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
      renderEditCell: (props) => CustomEditComponent(props, `Ox...`)
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
      headerName: "",
      field: "actions",
      sortable: false,
      width: 100,
      type: "actions",
      getActions: ({ id }) => {
        const apiRef = getRef();
        const isInEditMode = apiRef.current.getRowMode(id) === "edit";

        if (isInEditMode) {
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

        if (id === 0) return [];

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
  const [isDisabled, setIsDisabled] = useState(false);
  const [open, setOpen] = useState(false);
  const lockedContracts = useSelector(getLockedContracts);
  const { status, errorMessage } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { data, isLoading, isFetching, refetch } = useGetCommunityQuery(null, {
    refetchOnMountOrArgChange: true,
    skip: false
  });

  const [updateAdmins, { error, isLoading: adminsUpdating, isError, reset }] =
    useUpdateAdminsMutation();

  const AdminsMap = useMemo(() => {
    if (data && data.admins) {
      const mapped = data.admins.map((x, i) => {
        return { id: i, address: x };
      });
      setInitialData(mapped);
      return mapped;
    }
  }, [data]);

  useEffect(() => {
    console.log("adminsUpdating", adminsUpdating);
  }, [adminsUpdating]);

  const handleClose = () => {
    setOpen(false);
  };

  const submit = async () => {
    const state = apiRef?.current?.state;

    if (!state) {
      return;
    }

    const { allItems } = GetDatatableItems(state);
    const { removedItems, updatedItems, noChangedItems, newItems } =
      GetDatatableChangedItems(allItems, initialData);
    const addedAddresses = newItems.map((x) => x.address);
    const removedAddresses = removedItems.map((x) => x.address);
    if (!newItems.length && !removedItems.length) {
      setOpen(true);
      return;
    }
    await updateAdmins({ added: addedAddresses, removed: removedAddresses });
    // await dispatch(
    //   updateAdmins({ added: addedAdmins, removed: removedAdmins })
    // );
    // refetch();
  };

  // useEffect(() => {
  //   const fetchAdmins = async () => {
  //     const admins =
  //       await AutSDK.getInstance().daoExpander.contract.admins.getAdmins();
  //     debugger;
  //   };
  //   fetchAdmins();
  // }, []);

  // useEffect(() => {
  //   const [firstItem] = lockedContracts;

  //   // debugger;
  //   if (firstItem?.isNew) {
  //     const timeout = setTimeout(() => {
  //       if (apiRef.current) {
  //         apiRef.current.setRowMode(0, "edit");
  //       }
  //     });
  //     return () => clearTimeout(timeout);
  //   }
  //   setInitialData(lockedContracts);
  // }, [apiRef, lockedContracts]);

  // useEffect(() => {
  //   // const promise = dispatch(getPAContracts(null));
  //   // return () => promise.abort();
  // }, [dispatch]);

  return (
    <Container maxWidth="md" className="sw-core-team">
      <LoadingDialog open={adminsUpdating} message="Updating admins..." />
      <ErrorDialog
        open={open}
        handleClose={handleClose}
        message=" No new addresses were added!"
      />
      <ErrorDialog
        open={status === ResultState.Failed}
        handleClose={handleClose}
        message={errorMessage}
      />
      <Typography mt={7} textAlign="center" color="white" variant="h3">
        Admins
      </Typography>
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
            const rowsToEdit = Object.keys(state.editRows || {}).length;
            setIsDisabled(rowsToEdit > 0);
          }}
          components={{
            Toolbar: EditToolbar
          }}
          componentsProps={{
            toolbar: { apiRef, title: "Add new Admin", focusOn: "use" }
          }}
        />
      )}
      <div className="sw-table-actions">
        <Button
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
        </Button>
        {/* <AutButton
          onClick={submit}
          endIcon={<PinIcon />}
        >
          Save changes
        </AutButton> */}
      </div>
    </Container>
  );
};

export default Admins;
