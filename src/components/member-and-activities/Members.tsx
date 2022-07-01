import Typography from "@mui/material/Typography";
import { List, ListItem, Avatar, useTheme } from "@mui/material";
import { pxToRem } from "@utils/text-size";
import { AutList } from "@api/api.model";
import { Link } from "react-router-dom";
import { AutID } from "@api/aut.model";

const Members = ({ members }: { members:  AutID[] }) => {
  const theme = useTheme();
  return (
    <List
      className="members-grid"
      sx={{
        padding: 0,
        display: "grid",
        width: "100%",
        gridGap: pxToRem(45),
        gridTemplateColumns: `repeat(auto-fill, minmax(${pxToRem(150)}, 1fr))`,
        gridAutoRows: `minmax(${pxToRem(200)}, auto)`,
      }}
    >
      {members.map(({ image, name, properties }, subIndex) => {
        return (
          <ListItem
            component={Link}
            to={`members/${properties.address}`}
            sx={{
              border: "2px solid",
              borderColor: "transparent",
              cursor: 'pointer',
              width: pxToRem(150),
              height: pxToRem(200),
              display: "flex",
              transition: `${(theme.transitions).create(['border-color', 'background-color', 'color'], {
                duration: theme.transitions.duration.shortest,
                easing: theme.transitions.easing.easeOut
              })}`,
              flexDirection: "column",
              '&:hover': {
                borderColor: '#439EDD',
                backgroundColor: 'white',
                '.MuiTypography-root': {
                  color: '#000'
                }
              }
            }}
            key={subIndex}
            disablePadding
          >
            <Avatar
              sx={{
                boxSizing: "border-box",
                width: `calc(${pxToRem(150)} - 4px)`,
                height: pxToRem(150),
              }}
              src={image as string}
              variant="square"
            />
            <Typography
              sx={{
                color: "white",
                textAlign: "center",
                mt: "4px",
              }}
              fontSize={pxToRem(20)}
            >
              {name}
            </Typography>
          </ListItem>
        );
      })}
    </List>
  );
};

export default Members;
