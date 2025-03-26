import React, { useState, useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import MUIDataTable from "mui-datatables";
import TablePagination from "@material-ui/core/TablePagination";
import { useSnackbar } from "notistack";
import ky from "ky";

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
  pagination: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
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
          `https://be54-2409-40c0-11b2-2313-fdcf-4671-55d8-2e77.ngrok-free.app/submissions?page=${page}&limit=10`,
          {
            credentials: "include",
            headers: { Authorization: "Bearer " + getLtik() },
          }
        )
        .json();

      // Transform the data to match the table structure
      const transformedData = {
        items: response.submissions.map((item) => ({
          title: item.submission.title,
          userInfo: item.user,
          duration: item.submission.duration.formatted,
          artist: item.submission.artist,
          link: item.submission.link,
          createdat: item.submission.createdAt,
        })),
        pagination: response.pagination,
      };

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
      name: "link",
      label: "URL",
      options: {
        customBodyRender: (value) => (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        ),
      },
    },
    {
      name: "createdat",
      label: "Submitted At",
      options: {
        customBodyRender: (value) => new Date(value).toLocaleString(),
      },
    },
  ];

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
  };

  const handlePageChange = (event, newPage) => {
    fetchSubmissions(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    // Not implementing this since the API has fixed page size
    // But including it as it's required by TablePagination
  };

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      <div className={classes.paper}>
        <Grid container>
          <Grid item xs={12} className={classes.table}>
            <MUIDataTable
              title="Submitted Audio Records"
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
