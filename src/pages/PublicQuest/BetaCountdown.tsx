import { Stack, Typography } from "@mui/material";
import { useState, useEffect, memo } from "react";

const BetaCountdown = ({
  hasStarted,
  startDate,
  endDate
}: {
  hasStarted: boolean;
  startDate: number;
  endDate: number;
}) => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const getTime = () => {
    const date = hasStarted ? endDate : startDate;
    const time = new Date(date).getTime() - Date.now();

    setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((time / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((time / 1000 / 60) % 60));
    setSeconds(Math.floor((time / 1000) % 60));
  };

  useEffect(() => {
    const interval = setInterval(() => getTime(), 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="timer" role="timer">
      <Stack direction="column">
        <Stack direction="row" gap={1}>
          <Stack direction="column">
            <Typography
              color="primary.light"
              fontFamily="FractulAltBold"
              variant="subtitle2"
            >
              {days < 10 ? days : days}
            </Typography>
            <Typography
              color="white"
              fontFamily="FractulRegular"
              variant="body"
              className="text"
            >
              {days == 1 ? "Day" : "Days"}
            </Typography>
          </Stack>
          <Stack direction="column">
            <Typography
              color="primary.light"
              fontFamily="FractulAltBold"
              variant="subtitle2"
            >
              {hours < 10 ? hours : hours}
            </Typography>
            <Typography
              color="white"
              fontFamily="FractulRegular"
              variant="body"
              className="text"
            >
              {hours == 1 ? "Hour" : "Hours"}
            </Typography>
          </Stack>
          <Stack direction="column">
            <Typography
              color="primary.light"
              fontFamily="FractulAltBold"
              variant="subtitle2"
            >
              {minutes < 10 ? minutes : minutes}
            </Typography>
            <Typography
              color="white"
              fontFamily="FractulRegular"
              variant="body"
              className="text"
            >
              {minutes == 1 ? "Minute" : "Minutes"}
            </Typography>
          </Stack>
          <Stack direction="column">
            <Typography
              color="primary.light"
              fontFamily="FractulAltBold"
              variant="subtitle2"
            >
              {seconds < 10 ? seconds : seconds}
            </Typography>
            <Typography
              color="white"
              fontFamily="FractulRegular"
              variant="body"
              className="text"
            >
              {seconds == 1 ? "Second" : "Seconds"}
            </Typography>
          </Stack>
        </Stack>
        <Typography variant="caption" className="text-secondary">
          {!!hasStarted ? "Ends in" : "Starts in"}
        </Typography>
      </Stack>
    </div>
  );
};

export default memo(BetaCountdown);
