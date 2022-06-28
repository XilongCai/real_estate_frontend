import React, { useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
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


function Activation() {
    const navigate = useNavigate();
    const params = useParams();

    const globalDispatch = useContext(DispatchContext);
    const globalState = useContext(StateContext);

    async function activationHandler() {
        try {
            const response = await axios.post(
                'https://lbrepapi.com/api-auth-djoser/users/activation/', {
                uid: params.uid,
                token: params.token,
            });
            navigate("/login");
        } catch(e) {
            console.log(e.response);
        }
    }


    return (
        <div style={{
            width: '50%',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '3rem',
            border: '5px solid black',
            padding: '3rem',
        }}>
            <Typography variant="h4">Please click on the button below to activate
            your account</Typography>
            <Button variant="contained" fullWidth style={{marginTop: '1rem'}}
            onClick={activationHandler}>ACTIVATE</Button>
        </div>
    );
}

export default Activation;