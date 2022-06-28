import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

// MUI
import { Button, Typography, Grid, AppBar, Toolbar } from "@mui/material"

// Components
import { color } from "@mui/system";
import Header from "./Header";

// Assets
import img1 from './Assets/img1.jpg'


export function Home() {
    const [btnColor, setBtnColor] = useState("error");
    const navigate = useNavigate();
    return (
        <>
            <div style={{ position: 'relative' }}>
                <img src={img1} style={{
                    width: '100%',
                    height: '92vh'
                }} />
                <div style={{
                    position: 'absolute',
                    zIndex: '100',
                    top: '100px',
                    left: '20px',
                    textAlign: 'center'
                }}>
                    <Typography variant="h1" style={{
                        color: 'white',
                        fontWeight: 'bolder'
                    }}>FIND YOUR <span style={{ color: 'green' }}>NEXT PROPERTY</span> ON THIS WEBSITE</Typography>
                    <Button variant="contained" style={{
                        fontSize: '3.5rem',
                        borderRadius: '15px',
                        backgroundColor: 'green',
                        marginTop: '2rem',
                        boxShadow: '3px 3px 3px white'
                    }} onClick={() => navigate("/listings")}>
                        SEE ALL PROPERTIES
                    </Button>
                </div>
            </div>

        </>
    );
}