import { MutableRefObject, useMemo, useState } from "react";
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
import DeleteIcon from "@assets/actions/cancel.svg?react";
import EditIcon from "@assets/actions/edit.svg?react";
import { useSelector } from "react-redux";
import { RootState } from "@store/store.model";
import { ResultState } from "@store/result-status";
import LoadingDialog from "@components/Dialog/LoadingPopup";
import ErrorDialog from "@components/Dialog/ErrorPopup";
import { HubData } from "@store/Hub/hub.reducer";

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

  const handleCancelClick = (id) => (event) => {
    const apiRef = getRef();
    event.stopPropagation();
    apiRef.current.setRowMode(id, "view");
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
      headerName: "Domain",
      field: "domain",
      editable: true,
      flex: 1,
      sortable: false,
      cellClassName: "being-edited-cell",
      renderEditCell: (props) => CustomEditComponent(props, `Domain`)
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
              onClick={handleCancelClick(id)}
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
          />,
          <GridActionsCellItem
            icon={<CancelIcon />}
            label="Delete"
            className="textPrimary"
            onClick={handleDeleteClick(id)}
            color="inherit"
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

const DAut = () => {
  const { apiRef, columns } = useDatatableApiRef(tableColumns);
  const [initialData, setInitialData] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [open, setOpen] = useState(false);
  const hubData = useSelector(HubData);

  // const [updateDomains, { error, isLoading: domainsUpdating, isError, reset }] =
  //   useUpdateDomainsMutation();

  const DomainsMap = useMemo(() => {
    // const domains = data?.properties?.domains || [];
    const mapped = [];

    // if (domains.length) {
    //   mapped = domains.map((x, i) => {
    //     return { id: i, domain: x.domain, note: x.note };
    //   });
    // } else {
    //   mapped = [
    //     {
    //       id: 0,
    //       domain: "",
    //       note: ""
    //     }
    //   ];
    // }
    // setInitialData(mapped);
    return mapped;
  }, [hubData]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleError = () => {
    // reset();
  };

  const submit = async () => {
    const state = apiRef?.current?.state;
    if (!state) {
      return;
    }

    const { allItems } = GetDatatableItems(state);
    const { removedItems, updatedItems, newItems } = GetDatatableChangedItems(
      allItems,
      initialData
    );
    if (!newItems.length && !removedItems.length && !updatedItems.length) {
      setOpen(true);
      return;
    }

    // await updateDomains({
    //   hub: hubData,
    //   domains: allItems,
    //   refetch: refetch
    // });
  };

  return (
    <Container maxWidth="md" className="sw-core-team">
      {/* <LoadingDialog open={domainsUpdating} message="Updating domains..." /> */}
      <ErrorDialog
        open={open}
        handleClose={handleClose}
        message=" No new domains were added!"
      />
      {/* <ErrorDialog open={isError} handleClose={handleError} message={error} /> */}
      <Typography mt={7} textAlign="center" color="white" variant="h3">
        Domains
      </Typography>
      {/* {isLoading ? (
        <CircularProgress
          className="spinner-center"
          size="60px"
          style={{ top: "calc(50% - 30px)" }}
        />
      ) : (
        <>
          {data && data.hub && (
            <AutDatatable
              apiRef={apiRef}
              columns={columns}
              data={DomainsMap}
              loading={status === ResultState.Loading}
              isCellEditable={(params) => {
                return !params.row.locked;
              }}
              onStateChange={(state) => {
                const { allItems } = GetDatatableItems(state);
                const { removedItems, updatedItems, newItems } =
                  GetDatatableChangedItems(allItems, initialData, "domain");
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
                  title: "Add new Domain",
                  focusOn: "use",
                  isSaveDisabled: isDisabled,
                  domainsUpdating,
                  onSubmitChanges: submit
                }
              }}
            />
          )}
        </>
      )} */}
    </Container>
  );
};

export default DAut;
