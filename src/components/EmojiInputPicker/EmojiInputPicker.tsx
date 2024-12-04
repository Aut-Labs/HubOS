import React, { useRef, useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  TextField,
  IconButton,
  Popover,
  Paper,
  Box,
  InputAdornment,
  TextFieldProps
} from "@mui/material";
import EmojiIcon from "@assets/smile-emoji.svg?react";

interface EmojiOptionInputProps extends Omit<TextFieldProps, "onChange"> {
  onChange?: (value: { option: string; emoji: string }) => void;
  value?: { option: string; emoji: string };
  emojiButtonProps?: {
    disabled?: boolean;
  };
}

const EmojiOptionInput: React.FC<EmojiOptionInputProps> = ({
  onChange,
  value = { option: "", emoji: "" },
  emojiButtonProps,
  InputProps,
  ...textFieldProps
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    onChange?.({
      option: value.option,
      emoji: emoji.native
    });
    handleClose();
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.({
      option: e.target.value,
      emoji: value.emoji
    });
  };

  const open = Boolean(anchorEl);
  const id = open ? "emoji-popover" : undefined;

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", width: "100%" }}>
      <TextField
        {...textFieldProps}
        inputRef={inputRef}
        value={value.option}
        onChange={handleOptionChange}
        sx={{ flex: 1 }}
      />
      <TextField
        value={value.emoji}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="Choose emoji"
                onClick={handleClick}
                disabled={emojiButtonProps?.disabled}
                size="small"
                edge="end"
              >
                <EmojiIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{ width: "100px" }}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right"
        }}
        PaperProps={{
          sx: {
            border: "none",
            boxShadow: 3,
            borderRadius: 2,
            overflow: "hidden"
          }
        }}
      >
        <Paper elevation={0}>
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="light"
            previewPosition="none"
            skinTonePosition="none"
            maxFrequentRows={2}
          />
        </Paper>
      </Popover>
    </Box>
  );
};

export default EmojiOptionInput;
