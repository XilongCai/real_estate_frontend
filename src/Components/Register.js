import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
import { makeStyles } from "@mui/styles";
import axios from "axios";
import { useImmerReducer } from "use-immer";
//Component
import DispatchContext from "../Contexts/DispatchContext";
import StateContext from "../Contexts/StateContext";

const useStyles = makeStyles({
    formContainer: {
        width: '50%',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '3rem',
        border: '5px solid black',
        padding: '3rem',
    },
    registerBtn: {
        backgroundColor: 'green',
        color: 'white',
        fontSize: '1.1rem',
        marginLeft: '1rem',
        '&:hover': {
            backgroundColor: 'blue'
        },
    },
});

function Register() {
    const classes = useStyles();
    const navigate = useNavigate();

    const globalDispatch = useContext(DispatchContext);
    const globalState = useContext(StateContext);

    const initialState = {
        usernameValue: '',
        emailValue: '',
        passwordValue: '',
        rePasswordValue: '',
        sendRequest: 0,
        token: '',
        openSnack: false,
        disabledBtn: false,
        signUp: false,
        usernameErrors: {
            hasErrors: false,
            errorMessage: '',
        },
        emailErrors: {
            hasErrors: false,
            errorMessage: '',
        },
        passwordErrors: {
            hasErrors: false,
            errorMessage: '',
        },
        rePasswordHelperText: '',
        serverMessageUsername: '',
        serverMessageEmail: '',
        serverMessageSimilarPassword: '',
        serverMessageCommonPassword: '',
        serverMessageNumericPassword: '',
    };

    function reduceFunction(draft, action) {
        switch (action.type) {
            case "catchUsernameChange":
                draft.usernameValue = action.usernameChosen;
                draft.usernameErrors.hasErrors = false;
                draft.usernameErrors.errorMessage = '';
                draft.serverMessageUsername = '';
                break;
            case "catchEmailChange":
                draft.emailValue = action.emailChosen;
                draft.emailErrors.hasErrors = false;
                draft.emailErrors.errorMessage = '';
                draft.serverMessageEmail = '';
                break;
            case "catchPasswordChange":
                draft.passwordValue = action.passwordChosen;
                draft.passwordErrors.hasErrors = false;
                draft.passwordErrors.errorMessage = '';
                draft.serverMessageCommonPassword = '';
                draft.serverMessageSimilarPassword = '';
                draft.serverMessageNumericPassword = '';
                break;
            case "catchRePasswordChange":
                draft.rePasswordValue = action.rePasswordChosen;
                if (draft.rePasswordValue !== draft.passwordValue) {
                    draft.rePasswordHelperText = "The passwords must match";
                } else {
                    draft.rePasswordHelperText = "";
                }
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
            case "catchUsernameErrors":
                if (action.usernameChosen.length === 0) {
                    draft.usernameErrors.hasErrors = true;
                    draft.usernameErrors.errorMessage = "This field cannot be empty";
                } else if (action.usernameChosen.length < 5) {
                    draft.usernameErrors.hasErrors = true;
                    draft.usernameErrors.errorMessage = "This field must have at least 5 characters";
                } else if (!/^([a-zA-Z0-9]+)$/.test(action.usernameChosen)) {
                    draft.usernameErrors.hasErrors = true;
                    draft.usernameErrors.errorMessage = "This field cannot have special characters";
                }
                break;
            case "catchEmailErrors":
                if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                .test(action.emailChosen)) {
                    draft.emailErrors.hasErrors = true;
                    draft.emailErrors.errorMessage = "Please enter a valid email";
                }
                break;
            case "catchPasswordErrors":
                if (action.passwordChosen.length < 8) {
                    draft.passwordErrors.hasErrors = true;
                    draft.passwordErrors.errorMessage = "The password must at least have 8 characters";
                }
                break;
            case "usernameExits":
                draft.serverMessageUsername = "This username already exists";
                break;
            case "emailExits":
                draft.serverMessageEmail = "This email already exists";
                break;
            case "similarPassword":
                draft.serverMessageSimilarPassword = 'This password is too similar to the username';
                break;
            case "commonPassword":
                draft.serverMessageCommonPassword = 'This password is too common';
                break;
            case "numericPassword":
                draft.serverMessageNumericPassword = 'This password is entirely numeric';
                break;
            case "signUp":
                draft.signUp = true;
                break;
            case 'catchToken':
                draft.token = action.tokenValue;
                break;

        }
    }

    const [state, dispatch] = useImmerReducer(reduceFunction, initialState);

    function formSubmit(e) {
        e.preventDefault();
        if (!state.usernameErrors.hasErrors &&
            !state.emailErrors.hasErrors &&
            !state.passwordErrors.hasErrors &&
            state.rePasswordHelperText === "") {
                dispatch({type: 'changeSendRequest'});
                dispatch({type: 'disableTheButton'});
            }
    }

    useEffect(() => {
        if (state.sendRequest) {
            const source = axios.CancelToken.source();
            async function signUp() {
                try {
                    const response = await axios.post(
                        "http://localhost:8000/api-auth-djoser/users/",
                        {
                            username: state.usernameValue,
                            email: state.emailValue,
                            password: state.passwordValue,
                            re_password: state.rePasswordValue,
                        }, { cancelToken: source.token });
                    dispatch({type: 'openTheSnack'});
                    dispatch({type: 'signUp'});
                } catch (error) {
                    dispatch({type: 'allowTheButton'});
                    console.log(error.response);
                    if (error.response.data.username) {
                        dispatch({type: 'usernameExits'});
                    } else if (error.response.data.email) {
                        dispatch({type: 'emailExits'});
                    } else if (error.response.data.password[0] === 'This password is too similar to the username.') {
                        dispatch({type: 'similarPassword'});
                    } else if (error.response.data.password[0] === 'This password is too common.') {
                        dispatch({type: 'commonPassword'});
                    } else if (error.response.data.password[0] === 'This password is entirely numeric.') {
                        dispatch({type: 'numericPassword'});
                    }
                }
            }
            signUp();
            return () => {
                source.cancel();
            }
        }
    }, [state.sendRequest]);

    useEffect(() => {
        if (state.openSnack) {
            setTimeout(() => {
            }, 1500);
        }
    }, [state.openSnack]);

    useEffect(() => {
        if (state.signUp) {
            const source = axios.CancelToken.source();
            async function signIn() {
                try {
                    const response = await axios.post(
                        "http://localhost:8000/api-auth-djoser/token/login",
                        {
                            username: state.usernameValue,
                            password: state.passwordValue,
                        }, { cancelToken: source.token });
                    dispatch({type: 'catchToken', tokenValue: response.data.auth_token});
                    globalDispatch({type: 'catchToken', tokenValue: response.data.auth_token});
                    // console.log(response.data)
                } catch (error) {
                    console.log(error.response);
                }
            }
            signIn();
            return () => {
                source.cancel();
            }
        }
    }, [state.signUp]);

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
                    });
                    navigate("/");
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

    return (
        <div className={classes.formContainer}>
            <form onSubmit={formSubmit}>
                <Grid item container justifyContent="center">
                    <Typography variant="h4">CREATE AN ACCOUNT</Typography>
                </Grid>

                {state.serverMessageUsername ? <Alert severity="error">{state.serverMessageUsername}</Alert> : ''}
                {state.serverMessageEmail ? <Alert severity="error">{state.serverMessageEmail}</Alert> : ''}
                {state.serverMessageCommonPassword ? <Alert severity="error">{state.serverMessageCommonPassword}</Alert> : ''}
                {state.serverMessageSimilarPassword ? <Alert severity="error">{state.serverMessageSimilarPassword}</Alert> : ''}
                {state.serverMessageNumericPassword ? <Alert severity="error">{state.serverMessageNumericPassword}</Alert> : ''}
                <Grid item container style={{marginTop: '1rem'}}>
                    <TextField 
                        id="username" 
                        label="Username" 
                        variant="outlined" 
                        fullWidth value={state.usernameValue} 
                        onChange={(e) => dispatch({type: 'catchUsernameChange', usernameChosen: e.target.value})}
                        onBlur={(e) => dispatch({type: 'catchUsernameErrors', usernameChosen: e.target.value})}
                        error={state.usernameErrors.hasErrors}
                        helperText={state.usernameErrors.errorMessage}/>
                </Grid>
                <Grid item container style={{marginTop: '1rem'}}>
                    <TextField 
                        id="email" 
                        label="Email" 
                        variant="outlined" 
                        fullWidth
                        value={state.emailValue} 
                        onChange={(e) => dispatch({type: 'catchEmailChange', emailChosen: e.target.value})}
                        onBlur={(e) => dispatch({type: 'catchEmailErrors', emailChosen: e.target.value})}
                        error={state.emailErrors.hasErrors}
                        helperText={state.emailErrors.errorMessage}/>
                </Grid>
                <Grid item container style={{marginTop: '1rem'}}>
                    <TextField 
                        id="password" 
                        label="Password" 
                        variant="outlined" 
                        fullWidth 
                        type="password"
                        value={state.passwordValue} 
                        onChange={(e) => dispatch({type: 'catchPasswordChange', passwordChosen: e.target.value})}
                        onBlur={(e) => dispatch({type: 'catchPasswordErrors', passwordChosen: e.target.value})}
                        error={state.passwordErrors.hasErrors}
                        helperText={state.passwordErrors.errorMessage}/>
                </Grid>
                <Grid item container style={{marginTop: '1rem'}}>
                    <TextField 
                        id="confirm password" 
                        label="Confirm Password" 
                        variant="outlined" 
                        fullWidth 
                        type="password" 
                        value={state.rePasswordValue} 
                        onChange={(e) => dispatch({type: 'catchRePasswordChange', rePasswordChosen: e.target.value})}
                        helperText={state.rePasswordHelperText}/>
                </Grid>
                <Grid item container xs={8} style={{marginTop: '1rem', marginLeft: "auto", marginRight: "auto"}}>
                    <Button variant="contained" fullWidth type="submit" className={classes.registerBtn} disabled={state.disabledBtn}>SIGN UP</Button>
                </Grid>
            </form>
            <Grid item container justifyContent="center" style={{marginTop: '1rem'}}>
                <Typography variant="small">
                    Already have an account? <span onClick={() => navigate("/login")} style={{cursor: 'pointer', color: 'green'}}>SIGN IN</span>
                </Typography>
            </Grid>

            <Snackbar
                open={state.openSnack}
                message="You have successfully create an account"
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            />
        </div>
    );
}

export default Register;