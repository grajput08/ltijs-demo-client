import React, { useState, useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import MUIDataTable from "mui-datatables";
import TablePagination from "@material-ui/core/TablePagination";
import { useSnackbar } from "notistack";
import ky from "ky";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";

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
  transcriptContainer: {
    maxHeight: "500px",
    overflowY: "auto",
    padding: "15px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
  },
  audioSection: {
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
  },
  feedbackSection: {
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
  },
  sendButton: {
    marginTop: "10px",
    backgroundColor: theme.palette.primary.main,
    color: "#ffffff",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
    padding: "6px 16px",
    borderRadius: "20px",
  },
  studentInfo: {
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
}));

export default function SubmittedAudio() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState({
    items: [],
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      totalPages: 0,
    },
    isInstructor: false,
  });

  const getLtik = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const ltik = searchParams.get("ltik");
    if (!ltik) throw new Error("Missing lti key.");
    return ltik;
  };

  const fetchSubmissions = async (page = 1) => {
    try {
      const response = await ky
        .get(
          `https://be54-2409-40c0-11b2-2313-fdcf-4671-55d8-2e77.ngrok-free.app/submitted/audio?page=${page}&limit=10`,
          {
            credentials: "include",
            headers: { Authorization: "Bearer " + getLtik() },
          }
        )
        .json();

      const transformedData = {
        items: response.submissions.map((item) => ({
          id: item.id,
          title: item.submission.title,
          userInfo: item.user,
          duration: item.submission.duration.formatted,
          artist: item.submission.artist,
          transcript: item.submission.transcript,
          feedback: item.submission.feedback,
          link: item.submission.link,
          createdat: item.submission.createdAt,
        })),
        pagination: response.pagination,
        isInstructor: response.isInstructor,
      };
      console.log(
        "transformedData",
        transformedData,
        response.submissions,
        response
      );
      setData(transformedData);
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to fetch submissions: " + err.message, {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const columns = [
    {
      name: "title",
      label: "Assignment Title",
    },
    {
      name: "userInfo",
      label: "Student Name",
      options: {
        customBodyRender: (value) => value?.name || "N/A",
      },
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
      name: "createdat",
      label: "Submitted At",
      options: {
        customBodyRender: (value) => new Date(value).toLocaleString(),
      },
    },
  ];

  const renderTranscript = (transcript) => {
    if (!transcript) return "No transcript available";
    try {
      if (typeof transcript === "object") {
        return (
          <div style={{ lineHeight: "1.6" }}>
            {Object.entries(transcript).map(([timestamp, text]) => (
              <div key={timestamp} style={{ marginBottom: "1rem" }}>
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#666",
                    marginRight: "1rem",
                  }}
                >
                  {timestamp}:
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        );
      } else if (transcript.text) {
        return <div style={{ lineHeight: "1.6" }}>{transcript.text}</div>;
      }
      return "Invalid transcript format";
    } catch (err) {
      console.error("Error displaying transcript:", err);
      return "Error displaying transcript";
    }
  };

  const options = {
    filterType: "checkbox",
    selectableRows: "none",
    download: false,
    print: false,
    search: true,
    viewColumns: true,
    filter: true,
    rowsPerPage: 10,
    rowsPerPageOptions: [10],
    responsive: "scrollFullHeight",
    expandableRows: true,
    expandableRowsHeader: false,
    expandableRowsOnClick: true,
    renderExpandableRow: (rowData, rowMeta) => {
      const submission = data.items[rowMeta.dataIndex];

      return (
        <tr>
          <td colSpan={8}>
            <div className={classes.expandedSection}>
              <Grid container spacing={3} style={{ padding: "20px" }}>
                <Grid item xs={12} md={6}>
                  <div className={classes.studentInfo}>
                    <h4 className={classes.sectionTitle}>Information</h4>
                    <div className={classes.infoItem}>
                      <strong>Name:</strong> {submission.userInfo.name}
                    </div>
                    <div className={classes.infoItem}>
                      <strong>Assign Title:</strong> {submission.title}
                    </div>
                    {data.isInstructor ? (
                      <>
                        <div className={classes.infoItem}>
                          <strong>Student ID:</strong>{" "}
                          {submission.userInfo?.id || "N/A"}
                        </div>
                        <div className={classes.infoItem}>
                          <strong>Student Email:</strong>{" "}
                          {submission.userInfo?.email || "N/A"}
                        </div>
                        <div className={classes.infoItem}>
                          <strong>Submission ID:</strong> {submission.id}
                        </div>
                      </>
                    ) : null}
                    <div className={classes.infoItem}>
                      <strong>Full Duration:</strong> {submission.duration}
                    </div>
                  </div>

                  <div className={classes.audioSection}>
                    <h4 className={classes.sectionTitle}>Audio Submission</h4>
                    <audio
                      controls
                      style={{ width: "100%", marginBottom: "10px" }}
                    >
                      <source src={submission.link} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    <a
                      href={submission.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Audio
                    </a>
                  </div>

                  <div className={classes.feedbackSection}>
                    <h4 className={classes.sectionTitle}>
                      Instructor Feedback
                    </h4>
                    {data.isInstructor ? (
                      <>
                        <TextField
                          multiline
                          rows={4}
                          variant="outlined"
                          fullWidth
                          defaultValue={submission.feedback}
                          onChange={(e) =>
                            handleFeedbackChange(e, rowMeta.dataIndex)
                          }
                        />
                        <IconButton
                          onClick={() => handleSaveFeedback(rowMeta.dataIndex)}
                          className={classes.sendButton}
                          disabled={submittedFeedback[rowMeta.dataIndex]}
                        >
                          <SendIcon style={{ marginRight: "8px" }} />
                          <span>
                            {submittedFeedback[rowMeta.dataIndex]
                              ? "Sent"
                              : "Send"}
                          </span>
                        </IconButton>
                      </>
                    ) : (
                      <div style={{ padding: "10px" }}>
                        {submission.feedback || "No feedback provided yet"}
                      </div>
                    )}
                  </div>
                </Grid>

                <Grid item xs={12} md={6}>
                  <div className={classes.transcriptContainer}>
                    <h4 className={classes.sectionTitle}>Full Transcript</h4>
                    {renderTranscript(submission.transcript)}
                  </div>
                </Grid>
              </Grid>
            </div>
          </td>
        </tr>
      );
    },
  };

  const handlePageChange = (event, newPage) => {
    fetchSubmissions(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    // Not implementing this since the API has fixed page size
    // But including it as it's required by TablePagination
  };

  const [feedback, setFeedback] = useState({});
  const [submittedFeedback, setSubmittedFeedback] = useState({});

  useEffect(() => {
    if (data.items.length > 0) {
      const initialSubmittedState = {};
      data.items.forEach((item, index) => {
        initialSubmittedState[index] = !!item.feedback;
      });
      setSubmittedFeedback(initialSubmittedState);
    }
  }, [data.items]);

  const handleFeedbackChange = (event, rowIndex) => {
    setFeedback({
      ...feedback,
      [rowIndex]: event.target.value,
    });
    setSubmittedFeedback({
      ...submittedFeedback,
      [rowIndex]: false,
    });
  };

  const handleSaveFeedback = async (rowIndex) => {
    try {
      const submissionId = data.items[rowIndex]?.id;
      console.log("submissionId", submissionId, data);
      if (!submissionId) {
        throw new Error("Submission ID not found");
      }

      await ky.post(
        `https://be54-2409-40c0-11b2-2313-fdcf-4671-55d8-2e77.ngrok-free.app/feedback`,
        {
          json: {
            submissionId: submissionId,
            feedback: feedback[rowIndex],
          },
          headers: { Authorization: "Bearer " + getLtik() },
        }
      );
      setSubmittedFeedback({
        ...submittedFeedback,
        [rowIndex]: true,
      });
      enqueueSnackbar("Feedback saved successfully", { variant: "success" });
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to save feedback: " + err.message, {
        variant: "error",
      });
    }
  };

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <div className={classes.paper}>
        <Grid container>
          <Grid item xs={12} className={classes.table}>
            <MUIDataTable
              title={
                data.isInstructor ? "Instructor Dashboard" : "Student Dashboard"
              }
              data={data.items}
              columns={columns}
              options={options}
            />
            <TablePagination
              component="div"
              count={data.pagination.totalItems}
              page={data.pagination.currentPage - 1}
              onPageChange={handlePageChange}
              rowsPerPage={10}
              rowsPerPageOptions={[10]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Grid>
        </Grid>
      </div>
    </Container>
  );
}
