import React, { useDebugValue, useEffect, useState } from "react";
import { useImmerReducer } from "use-immer";
import { useNavigate } from "react-router-dom";
// MUI
import { Grid, AppBar, Typography, Button, Card, CardHeader, CardMedia, CardContent, CircularProgress, CardActions, IconButton, } from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
// React leaflet
import { MapContainer, Marker, TileLayer, Popup, Polygon, Polyline, useMap, } from 'react-leaflet';
import { Icon } from "leaflet";
// Map icons
import houseIconPng from "./Assets/Mapicons/house.png";
import apartmentIconPng from "./Assets/Mapicons/apartment.png";
import officeIconPng from "./Assets/Mapicons/office.png";
// Assets
import img1 from "./Assets/img1.jpg";
import axios from "axios";


function Listings() {
 
    const navigate =useNavigate();
    const houseIcon = new Icon({
        iconUrl: houseIconPng,
        iconSize: [40, 40],
    });
    const apartmentIcon = new Icon({
        iconUrl: apartmentIconPng,
        iconSize: [40, 40],
    });
    const officeIcon = new Icon({
        iconUrl: officeIconPng,
        iconSize: [40, 40],
    });

    const initialState = {
        mapInstance: null,
    };

    function reduceFunction(draft, action) {
        switch (action.type) {
            case "getMap":
                draft.mapInstance = action.mapData;
                break;
        }
    }

    const [state, dispatch] = useImmerReducer(reduceFunction, initialState);

    function TheMapComponent() {
        const map = useMap();
        dispatch({type: 'getMap', mapData: map});
        return null;
    }

    const [allListings, setAllListings] = useState([]);
    const [dataIsLoading, setDataIsLoading] = useState(true);

    useEffect(() => {
        const source = axios.CancelToken.source();
        async function getAllListings() {
            try {
                const response = await axios.get("https://lbrepapi.com/api/listings/", { cancelToken: source.token });
                setAllListings(response.data);
                setDataIsLoading(false);
                console.log("haha")
            } catch (error) {
                console.log(error.response);
            }
        }
        getAllListings();
        return () => {
            source.cancel();
        }
    }, []);

    if (dataIsLoading) {
        return (
            <Grid container justifyContent="center" alignItems="center" style={{height: '100vh'}}>
                <CircularProgress />
            </Grid>
        )
    }

    return (
        <Grid container>
            <Grid item xs={4}>
                {allListings.map((listing) => {
                    return (
                        <Card key={listing.id} style={{
                            margin: '0.5rem',
                            border: '1px solid black',
                            position: 'relative',
                        }}>
                            <CardHeader
                                action={
                                <IconButton aria-label="settings" 
                                    onClick={() => state.mapInstance.flyTo([listing.latitude, listing.longitude], 16)}>
                                    <RoomIcon />
                                </IconButton>
                                }
                                title={listing.title}
                            />
                            <CardMedia
                                style={{
                                    paddingRight: '1rem',
                                    paddingLeft: '1rem',
                                    height: '20rem',
                                    width: '30rem',
                                    cursor: 'pointer',
                                }}  
                                component="img"
                                image={listing.picture1}
                                alt={listing.title}
                                onClick={() => navigate(`/listings/${listing.id}`)}
                            />
                            <CardContent>
                                <Typography variant="body2">
                                    {listing.description.substring(0, 200)}...
                                </Typography>
                            </CardContent>
                            {listing.property_status === "Sale" ? (
                                <Typography style={{
                                    position: 'absolute',
                                    backgroundColor: 'green',
                                    zIndex: '1000',
                                    color:'white',
                                    top: '100px',
                                    left: '20px',
                                    padding: '5px',
                                }}>
                                    {listing.listing_type}: ${listing.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </Typography>
                            ) : (
                                <Typography style={{
                                    position: 'absolute',
                                    backgroundColor: 'green',
                                    zIndex: '1000',
                                    color:'white',
                                    top: '100px',
                                    left: '20px',
                                    padding: '5px',
                                }}>
                                    {listing.listing_type}: ${listing.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} / {listing.rental_frequency}
                                </Typography>
                            )}
                            <CardActions disableSpacing>
                                <IconButton aria-label="add to favorites">
                                {listing.seller_agency_name}
                                </IconButton>
                            </CardActions>
                        </Card>
                    )
                })}
            </Grid>
            <Grid item xs={8} style={{ marginTop: '0.5rem'}}>
                <AppBar position="sticky">
                    <div style={{ height: '100vh' }}>
                        <MapContainer center={[51.505, -0.09]} zoom={14} scrollWheelZoom={true}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <TheMapComponent />
                            {allListings.map((listing) => {
                                function iconDisplay() {
                                    if (listing.listing_type === "House") {
                                        return houseIcon;
                                    } else if (listing.listing_type === "Apartment") {
                                        return apartmentIcon;
                                    } else if (listing.listing_type === "Office") {
                                        return officeIcon;
                                    }
                                }
                                return (
                                    <Marker 
                                        key={listing.id}
                                        icon={iconDisplay()} 
                                        position={[
                                        listing.latitude,
                                        listing.longitude,
                                        ]}>
                                        <Popup>
                                            <Typography variant="h5">
                                                {listing.title}
                                            </Typography>
                                            <img src={listing.picture1} 
                                                style={{ height: '14rem', width: '18rem', cursor: 'pointer'}} 
                                                onClick={() => navigate(`/listings/${listing.id}`)}/>
                                            <Typography variant="body1">
                                                {listing.description.substring(0, 200)}...
                                            </Typography>
                                            <Button variant="contained" fullWidth 
                                                onClick={() => navigate(`/listings/${listing.id}`)}>
                                                Details
                                            </Button>
                                        </Popup>
                                    </Marker>
                                );
                            })};
                        </MapContainer>
                    </div>
                </AppBar>
            </Grid>
        </Grid>
    );
}

export default Listings;