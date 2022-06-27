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


function Login() {
    const navigate = useNavigate();

    const globalDispatch = useContext(DispatchContext);
    const globalState = useContext(StateContext);

    const initialState = {
        usernameValue: '',
        passwordValue: '',
        sendRequest: 0,
        token: '',
        openSnack: false,
        disabledBtn: false,
        serverError: false,
    };

    function reduceFunction(draft, action) {
        switch (action.type) {
            case "catchUsernameChange":
                draft.usernameValue = action.usernameChosen;
                draft.serverError = false;
                break;
            case "catchPasswordChange":
                draft.passwordValue = action.passwordChosen;
                draft.serverError = false;
                break;
            case 'catchToken':
                draft.token = action.tokenValue;
                break;
            case "changeSendRequest":
                draft.sendRequest = draft.sendRequest + 1;
                break;
            case "openTheSnack":
                draft.openSnack = true;
                break;
            case "disableTheButton":
                draft.disabledBtn = true;
                break;
            case "allowTheButton":
                draft.disabledBtn = false;
                break;
            case "catchServerError":
                draft.serverError = true;
                break;
        }
    }

    const [state, dispatch] = useImmerReducer(reduceFunction, initialState);

    function formSubmit(e) {
        e.preventDefault();
        dispatch({ type: "changeSendRequest" });
        dispatch({type: 'disableTheButton'});
    }

    useEffect(() => {
        if (state.sendRequest) {
            const source = axios.CancelToken.source();
            async function signIn() {
                try {
                    const response = await axios.post(
                        "http://localhost:8000/api-auth-djoser/token/login",
                        {
                            username: state.usernameValue,
                            password: state.passwordValue,
                        }, { cancelToken: source.token });
                    // navigate("/");
                    dispatch({type: 'catchToken', tokenValue: response.data.auth_token});
                    globalDispatch({type: 'catchToken', tokenValue: response.data.auth_token});
                    console.log(response.data)
                } catch (error) {
                    console.log(error.response);
                    dispatch({ type: 'allowTheButton' });
                    dispatch({ type: 'catchServerError'});
                }
            }
            signIn();
            return () => {
                source.cancel();
            }
        }
    }, [state.sendRequest]);

    useEffect(() => {
        if (state.token !== '') {
            const source = axios.CancelToken.source();
            async function getUserInfo() {
                try {
                    const response = await axios.get(
                        "http://localhost:8000/api-auth-djoser/users/me",
                        {
                            headers: {Authorization: 'Token '.concat(state.token)}
                        }, { cancelToken: source.token });
                    globalDispatch({
                        type: 'userSignsIn', 
                        usernameInfo: response.data.username,
                        emailInfo: response.data.email,
                        idInfo: response.data.id,
                    })
                    dispatch({type: 'openTheSnack'})
                } catch (error) {
                    console.log(error.response);
                }
            }
            getUserInfo();
            return () => {
                source.cancel();
            }
        }
    }, [state.token]);

    useEffect(() => {
        if (state.openSnack) {
            setTimeout(() => {
                navigate("/");
            }, 1500);
        }
    }, [state.openSnack]);


    return (
        <div style={{
            width: '50%',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '3rem',
            border: '5px solid black',
            padding: '3rem',
        }}>
            <form onSubmit={formSubmit}>
                <Grid item container justifyContent="center">
                    <Typography variant="h4">SIGN IN</Typography>
                </Grid>

                {state.serverError ? (<Alert severity="error">Incorrect username or password</Alert>)
                : ''}

                <Grid item container style={{marginTop: '1rem'}}>
                    <TextField 
                        id="username" 
                        label="Username" 
                        variant="outlined" 
                        fullWidth
                        value={state.usernameValue} 
                        onChange={(e) => dispatch({type: 'catchUsernameChange', usernameChosen: e.target.value})}
                        error={state.serverError}
                        />
                </Grid>
                <Grid item container style={{marginTop: '1rem'}}>
                    <TextField 
                        id="password" 
                        label="Password" 
                        variant="outlined" 
                        type="password"
                        fullWidth
                        value={state.passwordValue} 
                        onChange={(e) => dispatch({type: 'catchPasswordChange', passwordChosen: e.target.value})}
                        error={state.serverError}
                        />
                </Grid>
                <Grid item container xs={8} style={{marginTop: '1rem', marginLeft: "auto", marginRight: "auto"}}>
                    <Button variant="contained" fullWidth type="submit" style={{
                        backgroundColor: 'green',
                        color: 'white',
                        fontSize: '1.1rem',
                        marginLeft: '1rem',
                        '&:hover': {
                            backgroundColor: 'blue'
                        },
                    }} disabled={state.disabledBtn}>SIGN IN</Button>
                </Grid>
            </form>

            <Grid item container justifyContent="center" style={{marginTop: '1rem'}}>
                <Typography variant="small">
                    Don't have an account yet? <span onClick={() => navigate("/register")} style={{cursor: 'pointer', color: 'green'}}>SIGN UP</span>
                </Typography>
            </Grid>

            <Snackbar
                open={state.openSnack}
                message="You have successfully logged in"
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            />
        </div>
    );
}

export default Login;