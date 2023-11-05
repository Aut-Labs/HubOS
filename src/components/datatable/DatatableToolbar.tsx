import { GridToolbarContainer } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";

const EditToolbar = (props) => {
  const {
    apiRef,
    maxSize,
    title,
    focusOn,
    isSaveDisabled,
    adminsUpdating,
    onSubmitChanges
  } = props;

  const handleClick = () => {
    const ids =
      apiRef?.current?.getAllRowIds && apiRef?.current?.getAllRowIds();

    const id = ids?.length !== undefined ? ids[ids?.length - 1] + 1 : 0;
    apiRef.current.updateRows([{ id }]);
    apiRef.current.setRowMode(id, "edit");
    setTimeout(() => {
      apiRef.current.scrollToIndexes({
        rowIndex: apiRef.current.getRowsCount() - 1
      });
      apiRef.current.setCellFocus(id, focusOn);
    });
  };

  return (
    <GridToolbarContainer sx={{ justifyContent: "space-around" }}>
      <Button
        sx={{
          width: "220px"
        }}
        disabled={maxSize && apiRef?.current?.getAllRowIds()?.length >= maxSize}
        startIcon={<AddIcon />}
        type="button"
        color="offWhite"
        variant="outlined"
        size="medium"
        onClick={handleClick}
      >
        Add new
      </Button>
      <Button
        disabled={isSaveDisabled || adminsUpdating}
        type="button"
        color="offWhite"
        variant="outlined"
        size="medium"
        sx={{
          width: "220px"
        }}
        onClick={onSubmitChanges}
      >
        Save changes
      </Button>
    </GridToolbarContainer>
  );
};

export default EditToolbar;
