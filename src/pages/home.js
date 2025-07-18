import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Image from "material-ui-image";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import Fab from "@material-ui/core/Fab";
import GradeIcon from "@material-ui/icons/Grade";
import LinkIcon from "@material-ui/icons/Link";
import PersonIcon from "@material-ui/icons/Person";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import AudiotrackIcon from "@material-ui/icons/Audiotrack";
import QueueMusicIcon from "@material-ui/icons/QueueMusic";
import AssignmentIcon from "@material-ui/icons/Assignment";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import "animate.css";
import ky from "ky";

import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
  "@global": {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(0),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    alignContent: "center",
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  logodiv: {
    marginBottom: theme.spacing(8),
    backgroundColor: "transparent ",
  },
  logo: {
    cursor: "pointer",
    width: "300px",
    maxWidth: "100%",
  },
  logo1: {
    cursor: "pointer",
    margin: "auto",
    "@media (max-height: 700px)": {
      maxWidth: "80%",
    },
  },
  slider: {
    backgroundColor: "#013b6c",
  },
  sliderstyle: {
    marginTop: theme.spacing(3),
  },
  margin: {
    marginTop: theme.spacing(4),
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    backgroundColor: "#013b6c",
  },
  table1: {
    marginBottom: theme.spacing(4),
  },
  table2: {
    marginTop: theme.spacing(4),
  },
}));

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function App() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [info, setInfo] = useState();

  const errorPrompt = async (message) => {
    enqueueSnackbar(message, { variant: "error" });
  };

  const getLtik = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const ltik = searchParams.get("ltik");
    if (!ltik) throw new Error("Missing lti key.");
    return ltik;
  };

  const ltijs = async () => {
    const win = window.open("https://cvmcosta.me/ltijs", "_blank");
    win.focus();
  };

  useEffect(() => {
    const getInfo = async () => {
      try {
        const launchInfo = await ky
          .get(`${API_BASE_URL}/info`, {
            credentials: "include",
            headers: { Authorization: "Bearer " + getLtik() },
          })
          .json();
        console.log(launchInfo);
        setInfo(launchInfo);
      } catch (err) {
        console.log(err);
        errorPrompt(
          "Failed trying to retrieve custom parameters! " + err.message
        );
      }
    };
    getInfo();
  }, []);

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <div className={classes.paper}>
        <Grid container className={classes.logo}>
          <Grid item xs className={classes.logo1 + " blank"}>
            <Image
              className={classes.logo}
              src="https://raw.githubusercontent.com/Cvmcosta/ltijs/master/docs/logo-300.svg"
              onClick={ltijs}
              disableSpinner
            />
          </Grid>
        </Grid>
        {info ? (
          [
            <>
              {info.email || info.name ? (
                <>
                  <Typography variant="body1">User Info</Typography>
                  <TableContainer
                    className={
                      classes.table1 + " animate__animated animate__fadeIn"
                    }
                    component={Paper}
                  >
                    <Table aria-label="simple table">
                      <TableBody>
                        {info.name ? (
                          <TableRow key="name">
                            <TableCell component="th" scope="row">
                              Name
                            </TableCell>
                            <TableCell align="right">{info.name}</TableCell>
                          </TableRow>
                        ) : (
                          <></>
                        )}
                        {info.name ? (
                          <TableRow key="name">
                            <TableCell component="th" scope="row">
                              Name
                            </TableCell>
                            <TableCell align="right">{info.name}</TableCell>
                          </TableRow>
                        ) : (
                          <></>
                        )}
                        {info.email ? (
                          <TableRow key="email">
                            <TableCell component="th" scope="row">
                              Email
                            </TableCell>
                            <TableCell align="right">{info.email}</TableCell>
                          </TableRow>
                        ) : (
                          <></>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <></>
              )}
            </>,
            <>
              {info.roles ? (
                <>
                  <Typography variant="body1">Roles</Typography>
                  <TableContainer
                    className={
                      classes.table1 + " animate__animated animate__fadeIn"
                    }
                    component={Paper}
                  >
                    <Table aria-label="simple table">
                      <TableBody>
                        {info.roles.map((role) => (
                          <TableRow key="name">
                            <TableCell component="th" scope="row">
                              {role}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <></>
              )}
            </>,
            <>
              {info.userAssignment ? (
                <>
                  <Typography variant="body1">User Assignment</Typography>
                  <TableContainer
                    className={
                      classes.table1 + " animate__animated animate__fadeIn"
                    }
                    component={Paper}
                  >
                    <Table aria-label="simple table">
                      <TableBody>
                        {info.userAssignment.user ? (
                          <TableRow key="userId">
                            <TableCell component="th" scope="row">
                              User ID
                            </TableCell>
                            <TableCell align="right">
                              {info.userAssignment.user.user_id}
                            </TableCell>
                          </TableRow>
                        ) : (
                          <></>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <></>
              )}
            </>,
            <>
              {info.userAssignment && info.userAssignment.canvasData ? (
                <>
                  <Typography variant="body1">
                    Canvas Assignment Data
                  </Typography>
                  <TableContainer
                    className={
                      classes.table1 + " animate__animated animate__fadeIn"
                    }
                    component={Paper}
                  >
                    <Table aria-label="simple table">
                      <TableBody>
                        {info.userAssignment.canvasData.courseId ? (
                          <TableRow key="courseId">
                            <TableCell component="th" scope="row">
                              Course ID
                            </TableCell>
                            <TableCell align="right">
                              {info.userAssignment.canvasData.courseId}
                            </TableCell>
                          </TableRow>
                        ) : (
                          <></>
                        )}
                        {info.userAssignment.canvasData.assignmentId ? (
                          <TableRow key="assignmentId">
                            <TableCell component="th" scope="row">
                              Assignment ID
                            </TableCell>
                            <TableCell align="right">
                              {info.userAssignment.canvasData.assignmentId}
                            </TableCell>
                          </TableRow>
                        ) : (
                          <></>
                        )}
                        {info.userAssignment.canvasData.assignmentData ? (
                          <>
                            {info.userAssignment.canvasData.assignmentData ? (
                              <TableRow key="allowedAttempts">
                                <TableCell component="th" scope="row">
                                  Allowed Attempts
                                </TableCell>
                                <TableCell align="right">
                                  {info.userAssignment.canvasData.assignmentData
                                    .allowed_attempts === -1
                                    ? "Unlimited"
                                    : info.userAssignment.canvasData
                                        .assignmentData.allowed_attempts}
                                </TableCell>
                              </TableRow>
                            ) : (
                              <></>
                            )}
                            {info.userAssignment.canvasData.assignmentData ? (
                              <TableRow key="possiblePoints">
                                <TableCell component="th" scope="row">
                                  Possible Points
                                </TableCell>
                                <TableCell align="right">
                                  {
                                    info.userAssignment.canvasData
                                      .assignmentData.possible_points
                                  }
                                </TableCell>
                              </TableRow>
                            ) : (
                              <></>
                            )}
                          </>
                        ) : (
                          <></>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <></>
              )}
            </>,
          ]
        ) : (
          <></>
        )}

        <Typography variant="body1">Services</Typography>
        <Grid item xs>
          <Tooltip title="Grades Service" aria-label="grades">
            <Link
              to={{
                pathname: "/grades",
                search: document.location.search,
              }}
            >
              <Fab color="primary" aria-label="add" className={classes.margin}>
                <GradeIcon />
              </Fab>
            </Link>
          </Tooltip>
          <Tooltip title="Name and Roles Service" aria-label="nameRoles">
            <Link
              to={{
                pathname: "/nameRoles",
                search: document.location.search,
              }}
            >
              <Fab color="primary" aria-label="add" className={classes.margin}>
                <PersonIcon />
              </Fab>
            </Link>
          </Tooltip>
          <Tooltip title="Deep Linking Service" aria-label="deeplink">
            <Link
              to={{
                pathname: "/deeplink",
                search: document.location.search,
              }}
            >
              <Fab color="primary" aria-label="add" className={classes.margin}>
                <LinkIcon />
              </Fab>
            </Link>
          </Tooltip>
          <Tooltip title="Audio Submission" aria-label="audio">
            <Link
              to={{
                pathname: "/audio",
                search: document.location.search,
              }}
            >
              <Fab color="primary" aria-label="add" className={classes.margin}>
                <AudiotrackIcon />
              </Fab>
            </Link>
          </Tooltip>
          <Tooltip title="Audio List" aria-label="audioList">
            <Link
              to={{
                pathname: "/audioList",
                search: document.location.search,
              }}
            >
              <Fab color="primary" aria-label="add" className={classes.margin}>
                <QueueMusicIcon />
              </Fab>
            </Link>
          </Tooltip>
          <Tooltip title="Canvas Assignment API" aria-label="assignment">
            <Link
              to={{
                pathname: "/assignment",
                search: document.location.search,
              }}
            >
              <Fab color="primary" aria-label="add" className={classes.margin}>
                <AssignmentIcon />
              </Fab>
            </Link>
          </Tooltip>
        </Grid>
      </div>
    </Container>
  );
}
