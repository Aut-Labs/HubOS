import React, { useRef, useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  TextField,
  IconButton,
  Popover,
  Paper,
  InputAdornment,
  TextFieldProps
} from "@mui/material";
import EmojiIcon from "@assets/smile-emoji.svg?react";

// Helper functions for emoji handling
const removeEmojis = (text = "") => {
  return text.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, "").trim();
};

const hasEmoji = (text: string) => {
  const regexExp =
    /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
  return regexExp.test(text);
};

interface EmojiInputPickerProps extends Omit<TextFieldProps, "onChange"> {
  onChange?: (value: string) => void;
  emojiButtonProps?: {
    disabled?: boolean;
  };
}

const EmojiInputPicker: React.FC<EmojiInputPickerProps> = ({
  onChange,
  value = "",
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
    if (inputRef.current) {
      const cursorPosition = inputRef.current.selectionStart || 0;
      const textBeforeCursor = String(value).slice(0, cursorPosition);
      const textAfterCursor = String(value).slice(cursorPosition);

      const newText = `${textBeforeCursor}${emoji.native}${textAfterCursor}`;
      onChange?.(newText);

      handleClose();

      // Restore focus and cursor position
      setTimeout(() => {
        inputRef.current?.focus();
        const newPosition = cursorPosition + emoji.native.length;
        inputRef.current?.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "emoji-popover" : undefined;

  return (
    <>
      <TextField
        {...textFieldProps}
        inputRef={inputRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        InputProps={{
          ...InputProps,
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
    </>
  );
};

export default EmojiInputPicker;
