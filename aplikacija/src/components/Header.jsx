import React from "react";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";

const Header = ({ onNavigate }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Evidenca ur
        </Typography>
        <Button color="inherit" onClick={() => onNavigate("vnesiUre")}>
          Vnesi ure
        </Button>
        <Button color="inherit" onClick={() => onNavigate("mojaEvidenca")}>
          Moja evidenca
        </Button>
        <Button color="inherit" onClick={() => onNavigate("pregled")}>
          Pregled
        </Button>
        <Button color="inherit" onClick={() => onNavigate("monthlySummary")}>
          Mesečni Povzetek
        </Button>
        <Button color="inherit" onClick={() => onNavigate("employeeSummary")}>
          Povzetek Zaposlenih
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
