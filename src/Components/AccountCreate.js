import React, { useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useImmerReducer } from "use-immer";
// MUI
import { 
    Grid, 
    AppBar, 
    Typography, 
    Button, 
    Card, 
    CardHeader, 
    CardMedia, 
    CardContent, 
    CircularProgress,
    TextField,
    Snackbar,
    Alert,
    } from "@mui/material";

// Contexts
import DispatchContext from "../Contexts/DispatchContext";
import StateContext from "../Contexts/StateContext";


function AccountCreate() {
    const navigate = useNavigate();

    const globalDispatch = useContext(DispatchContext);
    const globalState = useContext(StateContext);


    return (
        <div style={{
            width: '50%',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '3rem',
            border: '5px solid black',
            padding: '3rem',
        }}>
            <Typography variant="h4">Thanks for signing up! To activate your account, Please
            click on the link that has been sent to your register email!</Typography>
        </div>
    );
}

export default AccountCreate;