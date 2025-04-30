import React, { useState, useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import MUIDataTable from "mui-datatables";
import { useSnackbar } from "notistack";
import ky from "ky";
import IconButton from "@material-ui/core/IconButton";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { Link } from "react-router-dom";
import Fab from "@material-ui/core/Fab";
import HomeIcon from "@material-ui/icons/Home";

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
  table: {
    marginTop: "5%",
  },
  expandedSection: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
    margin: "16px",
  },
  sectionTitle: {
    color: theme.palette.primary.main,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    paddingBottom: "8px",
    marginBottom: "16px",
    fontWeight: 500,
  },
  audioSection: {
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
  },
  userInfo: {
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
  },
  infoItem: {
    margin: "8px 0",
    display: "flex",
    alignItems: "center",
    "& strong": {
      minWidth: "120px",
      color: theme.palette.text.secondary,
    },
  },
  audioControls: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  playlistSection: {
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
  },
  playlistItem: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    marginBottom: "16px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
    },
  },
  playlistHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
    padding: "0 0 10px 0",
    borderBottom: "1px solid #eee",
  },
  playlistTitle: {
    fontSize: "1.1rem",
    fontWeight: "500",
    color: theme.palette.primary.main,
  },
  audioWrapper: {
    marginTop: "15px",
    marginBottom: "15px",
  },
  urlSection: {
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    wordBreak: "break-all",
    fontSize: "0.9rem",
    color: "#666",
  },
  home: {
    backgroundColor: "#013b6c",
    position: "fixed",
    bottom: "1vh",
    left: "1vh",
  },
}));

export default function AudioList() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState({
    recordings: [],
    pagination: {
      currentPage: 1,
      itemsPerPage: 5,
      totalItems: 0,
      totalPages: 0,
    },
  });
  const [playing, setPlaying] = useState(null); // Track currently playing audio

  const getLtik = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const ltik = searchParams.get("ltik");
    if (!ltik) throw new Error("Missing lti key.");
    return ltik;
  };

  const fetchRecordings = async (page = 1) => {
    try {
      const response = await ky
        .get(`${API_BASE_URL}/recordings?page=${page}&limit=5`, {
          credentials: "include",
          headers: { Authorization: "Bearer " + getLtik() },
        })
        .json();

      // Group recordings by user
      const userRecordingsMap = response.recordings.reduce(
        (acc, userRecordings) => {
          const userId = userRecordings.user.id;
          if (!acc[userId]) {
            acc[userId] = {
              user: userRecordings.user,
              recordings: [],
            };
          }
          acc[userId].recordings.push(...userRecordings.recordings);
          return acc;
        },
        {}
      );

      // Convert map to array and format for table
      const usersWithRecordings = Object.values(userRecordingsMap).map(
        ({ user, recordings }) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          recordingsCount: recordings.length,
          recordings: recordings.map((recording) => ({
            id: recording.id,
            title: recording.fileName,
            url: recording.fileUrl,
            mimeType: recording.mimeType,
            createdAt: recording.createdAt,
          })),
        })
      );

      setData({
        recordings: usersWithRecordings,
        pagination: response.pagination,
      });
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to fetch recordings: " + err.message, {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  // Add function to copy URL
  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    enqueueSnackbar("URL copied to clipboard!", { variant: "success" });
  };

  const columns = [
    {
      name: "name",
      label: "User Name",
    },
    {
      name: "email",
      label: "Email",
    },
    {
      name: "recordingsCount",
      label: "Total Recordings",
    },
    {
      name: "createdAt",
      label: "Last Recording",
      options: {
        customBodyRender: (value, tableMeta) => {
          const user = data.recordings[tableMeta.rowIndex];
          const latestRecording = user.recordings.reduce((latest, current) =>
            new Date(current.createdAt) > new Date(latest.createdAt)
              ? current
              : latest
          );
          return new Date(latestRecording.createdAt).toLocaleString();
        },
      },
    },
  ];

  const renderExpandableRow = (rowData, rowMeta) => {
    const user = data.recordings[rowMeta.dataIndex];

    return (
      <tr>
        <td colSpan={6}>
          <div className={classes.expandedSection}>
            <Grid container spacing={3} style={{ padding: "20px" }}>
              <Grid item xs={12} md={6}>
                <div className={classes.userInfo}>
                  <h4 className={classes.sectionTitle}>User Information</h4>
                  <div className={classes.infoItem}>
                    <strong>Name:</strong> {user.name}
                  </div>
                  <div className={classes.infoItem}>
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div className={classes.infoItem}>
                    <strong>Total Recordings:</strong> {user.recordingsCount}
                  </div>
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <div className={classes.playlistSection}>
                  <h4 className={classes.sectionTitle}>User's Playlist</h4>
                  {user.recordings.map((recording) => (
                    <div key={recording.id} className={classes.playlistItem}>
                      <div className={classes.playlistHeader}>
                        <div className={classes.playlistTitle}>
                          {recording.title}
                        </div>
                      </div>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <div className={classes.audioWrapper}>
                            <audio
                              controls
                              style={{ width: "100%", height: "40px" }}
                              id={`audio-${recording.id}`}
                              src={recording.url}
                              onEnded={() => setPlaying(null)}
                            />
                          </div>
                        </Grid>

                        <Grid item xs={12}>
                          <div className={classes.urlSection}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "8px",
                              }}
                            >
                              <div style={{ flexGrow: 1 }}>
                                <strong>File URL:</strong> {recording.url}
                              </div>
                              <IconButton
                                size="small"
                                onClick={() => handleCopyUrl(recording.url)}
                                style={{ flexShrink: 0 }}
                              >
                                <FileCopyIcon />
                              </IconButton>
                            </div>
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                  ))}
                </div>
              </Grid>
            </Grid>
          </div>
        </td>
      </tr>
    );
  };

  const options = {
    filterType: "checkbox",
    selectableRows: "none",
    download: false,
    print: false,
    search: true,
    viewColumns: true,
    filter: true,
    rowsPerPage: 5,
    rowsPerPageOptions: [5],
    responsive: "scrollFullHeight",
    expandableRows: true,
    expandableRowsHeader: false,
    expandableRowsOnClick: true,
    serverSide: true,
    count: data.pagination.totalItems,
    page: data.pagination.currentPage - 1,
    onTableChange: (action, tableState) => {
      if (action === "changePage") {
        fetchRecordings(tableState.page + 1);
      }
    },
    renderExpandableRow: renderExpandableRow,
  };

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <div className={classes.paper}>
        <Grid container>
          <Grid item xs={12} className={classes.table}>
            <MUIDataTable
              title="Audio Recordings by User"
              data={data.recordings}
              columns={columns}
              options={options}
            />
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
