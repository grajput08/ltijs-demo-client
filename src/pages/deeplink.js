import React, { useState, useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { Link } from "react-router-dom";
import Fab from "@material-ui/core/Fab";
import HomeIcon from "@material-ui/icons/Home";

import MUIDataTable from "mui-datatables";
import ky from "ky";
import NavigationIcon from "@material-ui/icons/Navigation";
import { useSnackbar } from "notistack";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const useStyles = makeStyles((theme) => ({
  "@global": {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    overflow: "hidden",
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  fab: {
    marginTop: theme.spacing(4),
  },
  btnDiv: {
    display: "flex",
    justifyContent: "center",
  },
  logodiv: {
    marginBottom: theme.spacing(8),
    backgroundColor: "transparent ",
  },
  logo: {
    cursor: "pointer",
  },
  margin: {
    marginTop: theme.spacing(4),
    backgroundColor: "#013b6c",
  },
  table: {
    marginTop: "10%",
  },
  home: {
    backgroundColor: "#013b6c",
    position: "fixed",
    bottom: "1vh",
    left: "1vh",
  },
}));

export default function App() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [resource, setResource] = useState(false);
  const [dataset, setDataset] = useState([]);
  const [selected, setSelected] = useState([]);

  const getLtik = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const ltik = searchParams.get("ltik");
    if (!ltik) throw new Error("Missing lti key.");
    return ltik;
  };

  const successPrompt = async (message) => {
    enqueueSnackbar(message, {
      variant: "success",
    });
  };

  const errorPrompt = async (message) => {
    enqueueSnackbar(message, { variant: "error" });
  };

  // Retrieves resource dataset
  useEffect(() => {
    const fetchAudioRecords = async () => {
      try {
        const audioRecords = await ky
          .get(`${API_BASE_URL}/resources`, {
            credentials: "include",
            headers: { Authorization: "Bearer " + getLtik() },
          })
          .json();
        setDataset(audioRecords);
      } catch (err) {
        console.log(err);
        errorPrompt("Failed retrieving audio records! " + err.message);
      }
    };
    fetchAudioRecords();
  }, []);

  // Submits resource to deep linking endpoint
  const submit = async () => {
    try {
      if (resource === false) {
        errorPrompt("Please select a resource");
        return;
      }
      await ky.post(`${API_BASE_URL}/submit/audio`, {
        credentials: "include",
        json: dataset[resource],
        headers: { Authorization: "Bearer " + getLtik() },
      });

      successPrompt("Resource successfully submitted!");
    } catch (err) {
      console.log(err);
      errorPrompt("Failed creating deep link! " + err);
    }
  };

  // Configuring data table
  const columns = [
    {
      name: "title",
      label: "Title",
    },
    {
      name: "duration",
      label: "Duration",
    },
    {
      name: "artist",
      label: "Artist",
    },
    {
      name: "link",
      label: "Audio",
      options: {
        customBodyRender: (value) => (
          <div style={{ minWidth: "250px" }}>
            <audio controls style={{ width: "100%", marginBottom: "5px" }}>
              <source src={value} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <a href={value} target="_blank" rel="noopener noreferrer">
              Download Audio
            </a>
          </div>
        ),
      },
    },
  ];

  const options = {
    filterType: "checkbox",
    selectableRows: "single",
    disableToolbarSelect: true,
    download: false,
    print: false,
    searchOpen: false,
    search: false,
    viewColumns: false,
    filter: false,
    selectableRowsOnClick: true,
    onRowsSelect: (selResource, allRows) => {
      setResource(selResource[0].dataIndex);
      setSelected(allRows.map((row) => row.dataIndex));
    },
    rowsSelected: selected,
    rowsPerPage: 5,
    responsive: "scrollFullHeight",
  };

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <div className={classes.paper}>
        <Grid container>
          <Grid item xs={12} className={classes.table}>
            <MUIDataTable
              title="Audio Records:"
              data={dataset}
              columns={columns}
              options={options}
            />
            <Grid item xs className={classes.btnDiv}>
              <Fab
                variant="extended"
                color="primary"
                aria-label="add"
                className={classes.fab}
                onClick={submit}
              >
                <NavigationIcon className={classes.extendedIcon} />
                Submit
              </Fab>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <Link
        to={{
          pathname: "/",
          search: document.location.search,
        }}
      >
        <Fab color="primary" aria-label="home" className={classes.home}>
          <HomeIcon />
        </Fab>
      </Link>
    </Container>
  );
}
