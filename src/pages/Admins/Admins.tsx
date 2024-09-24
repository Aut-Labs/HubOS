import { memo, MutableRefObject, useMemo, useState } from "react";
import {
  GridActionsCellItem,
  GridColumns,
  GridEditRowApi,
  GridRowApi
} from "@mui/x-data-grid";
import AutDatatable from "@components/datatable/Datatable";
import {
  CustomEditComponent,
  useDatatableApiRef
} from "@components/datatable/DatatableRef";
import { CircularProgress, Container, Typography } from "@mui/material";
import EditToolbar from "@components/datatable/DatatableToolbar";
import {
  GetDatatableItems,
  GetDatatableChangedItems
} from "@components/datatable/DatatableHelpers";
import SaveIcon from "@assets/actions/confirm.svg?react";
import CancelIcon from "@assets/actions/cancel.svg?react";
import EditIcon from "@assets/actions/edit.svg?react";
import { useSelector } from "react-redux";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import { useUpdateAdminsMutation } from "@api/hub.api";
import useQueryHubAdmins from "@hooks/useQueryHubAdmins";
import { HubAddress } from "@store/Hub/hub.reducer";

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
    },
    {
      headerName: "AutID Username",
      field: "note",
      editable: false,
      flex: 1,
      sortable: false,
      cellClassName: "being-edited-cell-note",
      // renderEditCell: (props) =>
      //   CustomEditComponent(props, `AutID Username`)
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
                placeholder=""
                onPointerEnterCapture={null}
                onPointerLeaveCapture={null}
                showInMenu={true}
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
              placeholder=""
              onPointerEnterCapture={null}
              onPointerLeaveCapture={null}
              showInMenu={true}
            />,
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
              color="primary"
              placeholder=""
              onPointerEnterCapture={null}
              onPointerLeaveCapture={null}
              showInMenu={true}
            />
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="secondary"
            placeholder=""
            onPointerEnterCapture={null}
            onPointerLeaveCapture={null}
            showInMenu={true}
          />
        ];
      }
    }
  ];
};

const Admins = () => {
  const { apiRef, columns } = useDatatableApiRef(tableColumns);
  const [initialData, setInitialData] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [open, setOpen] = useState(false);
  const hubAddress = useSelector(HubAddress);

  const { data, loading: isLoading } = useQueryHubAdmins({
    skip: !hubAddress,
    variables: {
      skip: 0,
      first: 5,
      where: {
        hubAddress
      }
    }
  });

  const [updateAdmins, { error, isLoading: adminsUpdating, isError, reset }] =
    useUpdateAdminsMutation();

  const AdminsMap = useMemo(() => {
    if (data) {
      const mapped = data.map((x, i) => {
        return { id: i, address: x.properties.address, note: x.name };
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
          <AutDatatable
            apiRef={apiRef}
            columns={columns}
            data={AdminsMap}
            loading={isLoading}
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
        </>
      )}
    </Container>
  );
};

export default memo(Admins);
