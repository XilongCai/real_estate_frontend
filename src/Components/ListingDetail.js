import React, { useEffect, useState, useRef, useMemo, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Axios from "axios";
import { useImmerReducer } from "use-immer";

// Contexts
import StateContext from "../Contexts/StateContext";

// Assets
import defaultProfilePicture from "./Assets/defaultProfilePicture.jpg";
import stadiumIconPng from "./Assets/Mapicons/stadium.png";
import hospitalIconPng from "./Assets/Mapicons/hospital.png";
import universityIconPng from "./Assets/Mapicons/university.png";

//Components
import ListingUpdate from "./ListingUpdate";

// react-leaflet
import { MapContainer, TileLayer, useMap, Polygon, Marker, Popup } from 'react-leaflet';
import { Icon } from "leaflet";

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
    FormControlLabel,
    Checkbox,
    IconButton,
    CardActions,
    Breadcrumbs,
    Link,
    Dialog,
    Snackbar,
} from "@mui/material";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import RoomIcon from "@mui/icons-material/Room";
import CheckBoxIcon from "@mui/icons-material/CheckBox";


function ListingDetail() {
    const navigate = useNavigate();
    const GlobalState = useContext(StateContext);

    const params = useParams();

    const stadiumIcon = new Icon(
        {
            iconUrl: stadiumIconPng,
            iconSize: [40, 40],
        }
    );
    const hospitalIcon = new Icon(
        {
            iconUrl: hospitalIconPng,
            iconSize: [40, 40],
        }
    );
    const universityIcon = new Icon(
        {
            iconUrl: universityIconPng,
            iconSize: [40, 40],
        }
    );

    const initialState = {
        listingInfo: '',
        dataIsLoading: true,
        sellerProfileInfo: '',
        openSnack: false,
        disabledBtn: false,
    };

    function ReducerFuction(draft, action) {
        switch (action.type) {
            case "catchListingInfo":
                draft.listingInfo = action.listingObject;
                break;
            case "loadingDone":
                draft.dataIsLoading = false;
                break;
            case 'catchSellerProfileInfo':
                draft.sellerProfileInfo = action.profileObject;
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
        }
    }

    const [state, dispatch] = useImmerReducer(ReducerFuction, initialState);

    // request to get profile info
    useEffect(() => {
        async function GetListingInfo() {
            try {
                console.log(params.id);
                const response = await Axios.get(
                    `http://localhost:8000/api/listings/${params.id}`);

                dispatch({
                    type: "catchListingInfo",
                    listingObject: response.data,
                });
                dispatch({ type: "loadingDone" });
            } catch (e) {
                console.log(e.response);
            }
        }
        GetListingInfo();
    }, []);

    // request to get profile info
    useEffect(() => {
        if (state.listingInfo) {
            async function GetProfileInfo() {
                try {
                    const response = await Axios.get(
                        `http://localhost:8000/api/profiles/${state.listingInfo.seller}/`
                    );

                    console.log(response);

                    dispatch({
                        type: "catchSellerProfileInfo",
                        profileObject: response.data,
                    });
                    dispatch({ type: "loadingDone" });
                } catch (e) { }
            }
            GetProfileInfo();
        }
    }, [state.listingInfo]);

    useEffect(() => {
        if (state.openSnack) {
            setTimeout(() => {
                navigate("/listings");
            }, 1500);
        }
    }, [state.openSnack]);

    const date = new Date(state.listingInfo.date_posted);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

    async function deleteHandler() {
        const confirmDelete = window.confirm('Are you sure to delete this listing?');
        if (confirmDelete) {
            try {
                const response = await Axios.delete(`http://localhost:8000/api/listings/${params.id}/delete/`);
                dispatch({type: "openTheSnack"});
                dispatch({type: "disableTheButton"});
            } catch(e) {
                dispatch({type: "allowTheButton"});
                console.log(e.response.data);
            }
        }
    }

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    if (state.dataIsLoading === true) {
        return (
            <Grid
                container
                justifyContent="center"
                alignItems="center"
                style={{ height: "100vh" }}
            >
                <CircularProgress />
            </Grid>
        );
    }

    return (<div style={{ marginLeft: '2rem', marginRight: '2rem', marginBottom: '2rem' }}>
        <Grid item style={{ marginTop: '1rem' }}>
            <Breadcrumbs aria-label="breadcrumb">
                <Link underline="hover" color="inherit"
                    onClick={() => navigate("/listings")}
                    style={{ cursor: 'pointer' }}>
                    Listings
                </Link>

                <Typography color="text.primary">{state.listingInfo.title}</Typography>
            </Breadcrumbs>
        </Grid>

        <Grid item container justifyContent='center' style={{
            position: 'relative',
            marginTop: '1rem',
        }}>
            <div>
                <img src={state.listingInfo.picture1} style={{ width: '20rem', height: '20rem' }} />
            </div>
        </Grid>

        <Grid item container style={{ padding: '1rem', border: '1px solid black', marginTop: '1rem', }}>
            <Grid item container xs={7} direction="column" spacing={1}>
                <Grid item>
                    <Typography variant="h5">{state.listingInfo.title}</Typography>
                </Grid>
                <Grid item>
                    <RoomIcon />{" "}
                    <Typography variant="h6">{state.listingInfo.borough}</Typography>
                </Grid>
                <Grid item>
                    <Typography variant="subtitle1">{formattedDate}</Typography>
                </Grid>
            </Grid>

            <Grid item container xs={5} alignItems="center">
                <Typography variant="h6" style={{ fontWeight: 'bolder', color: 'green' }}>
                    {state.listingInfo.listing_type} | {" "}
                    {state.listingInfo.property_status === 'Sale'
                        ? `$${state.listingInfo.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                        : `${state.listingInfo.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}/${state.listingInfo.rental_frequency}`}
                </Typography>
            </Grid>
        </Grid>

        <Grid item container justifyContent="flex-start"
            style={{ padding: '1rem', border: '1px solid black', marginTop: '1rem', }}>
            {state.listingInfo.rooms ? (
                <Grid item xs={2} style={{ display: 'flex' }}>
                    <Typography variant="h6">
                        {state.listingInfo.rooms} Rooms
                    </Typography>
                </Grid>
            ) : ''}

            {state.listingInfo.furnished ? (
                <Grid item xs={2} style={{ display: 'flex' }}>
                    <CheckBoxIcon style={{ color: 'green', fontSize: '2rem' }} /> {" "}
                    <Typography variant="h6">Furnished</Typography>
                </Grid>
            ) : ''}

            {state.listingInfo.pool ? (
                <Grid item xs={2} style={{ display: 'flex' }}>
                    <CheckBoxIcon style={{ color: 'green', fontSize: '2rem' }} /> {" "}
                    <Typography variant="h6">Pool</Typography>
                </Grid>
            ) : ''}

            {state.listingInfo.elevator ? (
                <Grid item xs={2} style={{ display: 'flex' }}>
                    <CheckBoxIcon style={{ color: 'green', fontSize: '2rem' }} /> {" "}
                    <Typography variant="h6">Elevator</Typography>
                </Grid>
            ) : ''}

            {state.listingInfo.cctv ? (
                <Grid item xs={2} style={{ display: 'flex' }}>
                    <CheckBoxIcon style={{ color: 'green', fontSize: '2rem' }} /> {" "}
                    <Typography variant="h6">Cctv</Typography>
                </Grid>
            ) : ''}

            {state.listingInfo.parking ? (
                <Grid item xs={2} style={{ display: 'flex' }}>
                    <CheckBoxIcon style={{ color: 'green', fontSize: '2rem' }} /> {" "}
                    <Typography variant="h6">Parking</Typography>
                </Grid>
            ) : ''}
        </Grid>

        {state.listingInfo.description ? (
            <Grid item
                style={{ padding: '1rem', border: '1px solid black', marginTop: '1rem', }}>
                <Typography variant="h5">Description</Typography>
                <Typography variant="h6">{state.listingInfo.description}</Typography>
            </Grid>
        ) : ''}

        <Grid
            container
            style={{
                width: "50%",
                marginLeft: "auto",
                marginRight: "auto",
                border: "5px solid black",
                marginTop: "1rem",
                padding: "5px",
            }}
        >
            <Grid item xs={6}>
                <img
                    style={{ height: "10rem", width: "15rem", cursor: "pointer" }}
                    src={
                        state.sellerProfileInfo.profile_picture !== null
                            ? state.sellerProfileInfo.profile_picture
                            : defaultProfilePicture
                    }
                    onClick={() => navigate(`/agencies/${state.sellerProfileInfo.seller}`)}
                />
            </Grid>
            <Grid
                item
                container
                direction="column"
                justifyContent="center"
                xs={6}
            >
                <Grid item>
                    <Typography
                        variant="h5"
                        style={{ textAlign: "center", marginTop: "1rem" }}
                    >
                        <span style={{ color: "green", fontWeight: "bolder" }}>
                            {state.sellerProfileInfo.agency_name}
                        </span>
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography
                        variant="h5"
                        style={{ textAlign: "center", marginTop: "1rem" }}
                    >
                        <IconButton>
                            <LocalPhoneIcon /> {state.sellerProfileInfo.phone_number}
                        </IconButton>
                    </Typography>
                </Grid>
            </Grid>

            <Grid item>
                {GlobalState.userId == state.listingInfo.seller ? (
                    <Grid item container justifyContent="space-around">
                        <Button variant="contained" color="primary" onClick={handleClickOpen}>Update</Button>
                        <Button variant="contained" color="error" onClick={deleteHandler} disabled={state.disabledBtn}>Delete</Button>
                        <Dialog open={open} onClose={handleClose} fullScreen>
                            <ListingUpdate listingData={state.listingInfo} closeDialog={handleClose}/>
                        </Dialog>
                    </Grid>
                ) : ''}
            </Grid>
        </Grid>

        <Grid item container style={{ marginTop: '1rem' }} spacing={1} justifyContent="space-between">
            <Grid item xs={3} style={{ overflow: 'auto', height: '35rem' }}>
                {state.listingInfo.listing_pois_within_10km.map(poi => {
                    function degreeToRadium(coordinate) {
                        return coordinate * Math.PI / 100;
                    }

                    function CalculateDistance() {
                        const latitude1 = degreeToRadium(state.listingInfo.latitude);
                        const longitude1 = degreeToRadium(state.listingInfo.longitude);

                        const latitude2 = degreeToRadium(poi.location.coordinates[0]);
                        const longitude2 = degreeToRadium(poi.location.coordinates[1]);

                        // The formula
                        const latDiff = latitude2 - latitude1;
                        const lonDiff = longitude2 - longitude1;
                        const R = 6371000 / 1000;

                        const a =
                            Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
                            Math.cos(latitude1) *
                                Math.cos(latitude2) *
                                Math.sin(lonDiff / 2) *
                                Math.sin(lonDiff / 2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                        const d = R * c;

                        const dist =
                            Math.acos(
                                Math.sin(latitude1) * Math.sin(latitude2) +
                                    Math.cos(latitude1) *
                                        Math.cos(latitude2) *
                                        Math.cos(lonDiff)
                            ) * R;
                        return dist.toFixed(2);
                    }
                    return (
                        <div key={poi.id} style={{ marginBottom: '0.5 rem', border: '1px solid black '}}>
                            <Typography variant="h6">{poi.name}</Typography>
                            <Typography variant="subtitle1">{poi.type} | <span style={{fontWeight: 'bolder', color: 'green'}}>{CalculateDistance()} Kilometers</span></Typography>
                        </div>
                    );
                })}
            </Grid>
            <Grid item xs={9} style={{ height: '35rem' }}>
                <MapContainer center={[
                    state.listingInfo.latitude,
                    state.listingInfo.longitude,
                ]} zoom={14} scrollWheelZoom={true}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                        position={[
                            state.listingInfo.latitude,
                            state.listingInfo.longitude,
                        ]}
                    >
                        <Popup>
                            {state.listingInfo.title}
                        </Popup>
                    </Marker>
                    {state.listingInfo.listing_pois_within_10km.map(poi => {
                        function poiIcon() {
                            if (poi.type === 'Stadium') {
                                return stadiumIcon;
                            } else if (poi.type === 'Hospital') {
                                return hospitalIcon;
                            } else if (poi.type === 'University') {
                                return universityIcon;
                            }
                        }
                        return (
                            <Marker
                                key={poi.id}
                                position={[poi.location.coordinates[0], poi.location.coordinates[1]]}
                                icon={poiIcon()}>
                                <Popup>
                                    {poi.name}
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </Grid>
        </Grid>

        <Snackbar
            open={state.openSnack}
            message="You have successfully create an account"
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
        />
    </div>);
}

export default ListingDetail;