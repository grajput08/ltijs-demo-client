import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Fab from "@material-ui/core/Fab";
import HomeIcon from "@material-ui/icons/Home";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import ky from "ky";
import { useSnackbar } from "notistack";
import ReactJsonView from "react-json-view";

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
  logodiv: {
    marginBottom: theme.spacing(8),
    backgroundColor: "transparent ",
  },
  logo: {
    cursor: "pointer",
  },
  logo1: {
    cursor: "pointer",
    margin: "auto",
    "@media (max-height: 700px)": {
      maxWidth: "80%",
    },
  },
  home: {
    backgroundColor: "#013b6c",
    position: "fixed",
    bottom: "1vh",
    left: "1vh",
  },
  responseContainer: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    maxWidth: "100%",
    width: "100%",
    height: "600px",
    maxHeight: "600px",
    overflow: "auto",
    backgroundColor: "black",
    color: "white",
  },
  responseText: {
    fontFamily: "monospace",
    fontSize: "14px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  jsonViewer: {
    marginTop: theme.spacing(2),
    "& .react-json-view": {
      fontSize: "14px",
    },
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing(4),
  },
  errorContainer: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: "#ffebee",
    border: "1px solid #f44336",
    borderRadius: "4px",
  },
}));

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

export default function Assignment() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getLtik = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const ltik = searchParams.get("ltik");
    if (!ltik) throw new Error("Missing lti key.");
    return ltik;
  };

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ky.get(`${API_BASE_URL}/canvas/assignment`, {
        credentials: "include",
        headers: {
          Authorization: "Bearer " + getLtik(),
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setApiResponse(data);
      enqueueSnackbar("Assignment data fetched successfully!", {
        variant: "success",
      });
    } catch (err) {
      console.error("Error fetching assignment data:", err);
      setError(err.message || "Failed to fetch assignment data");
      enqueueSnackbar("Failed to fetch assignment data: " + err.message, {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
  }, []);

  const ltijs = async () => {
    const win = window.open("https://cvmcosta.me/ltijs", "_blank");
    win.focus();
  };

  return (
    <Container component="main" maxWidth="md">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography variant="h4" gutterBottom>
          Canvas Assignment API Response
        </Typography>

        <Typography variant="body1" color="textSecondary" gutterBottom>
          This page displays the response from the Canvas assignment endpoint
        </Typography>

        {loading && (
          <div className={classes.loadingContainer}>
            <CircularProgress />
            <Typography variant="body1" style={{ marginLeft: "16px" }}>
              Fetching assignment data...
            </Typography>
          </div>
        )}

        {error && (
          <Paper className={classes.errorContainer}>
            <Typography variant="h6" color="error" gutterBottom>
              Error
            </Typography>
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          </Paper>
        )}

        {apiResponse && !loading && (
          <Paper className={classes.responseContainer}>
            <Typography variant="h6" gutterBottom>
              API Response:
            </Typography>
            <div className={classes.jsonViewer}>
              <ReactJsonView
                src={apiResponse}
                theme="monokai"
                style={{ backgroundColor: "transparent" }}
                displayDataTypes={false}
                displayObjectSize={true}
                enableClipboard={true}
                name={null}
                collapsed={2}
                collapseStringsAfterLength={80}
              />
            </div>
          </Paper>
        )}
      </div>

      <Link
        to={{
          pathname: "/",
          search: window.location.search,
        }}
      >
        <Fab
          variant="extended"
          color="primary"
          aria-label="home"
          className={classes.home}
        >
          <HomeIcon className={classes.extendedIcon} />
          Home
        </Fab>
      </Link>
    </Container>
  );
}
