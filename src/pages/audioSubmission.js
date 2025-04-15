import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import AudiotrackIcon from "@material-ui/icons/Audiotrack";
import { useSnackbar } from "notistack";
import ky from "ky";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  audioPlayer: {
    width: "100%",
    marginTop: theme.spacing(2),
  },
  selectedFile: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
  },
}));

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function AudioSubmission() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedAudio, setSelectedAudio] = useState(null);

  const getLtik = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const ltik = searchParams.get("ltik");
    if (!ltik) throw new Error("Missing lti key.");
    return ltik;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAudio) {
      enqueueSnackbar("Please select an audio file", { variant: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("audio", selectedAudio);

    try {
      await ky.post(`${API_BASE_URL}/upload/audio`, {
        body: formData,
        credentials: "include",
        headers: {
          Authorization: "Bearer " + getLtik(),
        },
      });

      enqueueSnackbar("Audio submitted successfully!", { variant: "success" });
      setSelectedAudio(null);
    } catch (error) {
      console.error(error);
      console.log("error", error);
      enqueueSnackbar("Failed to submit audio: " + error.message, {
        variant: "error",
      });
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      setSelectedAudio(file);
    } else {
      enqueueSnackbar("Please select a valid audio file", { variant: "error" });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <CssBaseline />
      <Paper className={classes.paper}>
        <AudiotrackIcon fontSize="large" color="primary" />
        <Typography component="h1" variant="h5">
          Audio Submission
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <input
            accept="audio/*"
            style={{ display: "none" }}
            id="audio-file"
            type="file"
            onChange={handleAudioChange}
          />
          <label htmlFor="audio-file">
            <Button
              fullWidth
              variant="contained"
              color="primary"
              component="span"
            >
              Select Audio File
            </Button>
          </label>

          {selectedAudio && (
            <div className={classes.selectedFile}>
              <Typography>Selected file: {selectedAudio.name}</Typography>
              <audio
                className={classes.audioPlayer}
                controls
                src={URL.createObjectURL(selectedAudio)}
              />
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={!selectedAudio}
          >
            Submit Audio
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
