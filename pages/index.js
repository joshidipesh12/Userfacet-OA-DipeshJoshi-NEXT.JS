import React, { useEffect, useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import config from "../public/availability.json";
import consts from "../public/constants.json";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

import { useSnackbar } from "react-simple-snackbar";

export default function Home() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [weekday, setWeekday] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [openSnackbar] = useSnackbar();

  useEffect(() => {
    console.log(localStorage.getItem("weekday"));
    setWeekday(localStorage.getItem("weekday") ?? "");
    setStart(localStorage.getItem("start") ?? "");
    setEnd(localStorage.getItem("end") ?? "");
  }, []);

  useEffect(() => {
    localStorage.setItem("weekday", weekday);
    localStorage.setItem("start", start);
    localStorage.setItem("end", end);
  }, [weekday, start, end]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (
      !fullName.length ||
      !email.length ||
      !weekday.length ||
      !start.length ||
      !end.length
    ) {
      return openSnackbar("Please Fill Details Properly!");
    }
    try {
      let res = await fetch("/api/new_slot", {
        method: "POST",
        "Content-Type": "application/json",
        body: {
          full_name: fullName,
          email: email,
          weekday: weekday,
          start_time: start,
          end_time: end,
        },
      });
      let resJson = await res.json();
      if (res.slot_confirmed === "true") {
        openSnackbar(`Slot Confirmed for ${resJson.date}`);
      } else {
        openSnackbar(resJson.reason);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.h1}>Class Slot Scheduler</h1>
        <div className={styles.bottom_container}>
          <div className={styles.availability}>
            <Typography variant="h6" gutterBottom component="div">
              Available Slots
            </Typography>
            <TableContainer component={Paper}>
              <Table aria-label="collapsible table">
                {Object.keys(config.availability).map((day) => (
                  <SlotDayRow key={day} day={day} />
                ))}
              </Table>
            </TableContainer>
          </div>
          <form
            action="/api/new_slot"
            method="POST"
            className={styles.form_container}
            onSubmit={submitHandler}
          >
            <div className={styles.section}>
              <TextField
                value={fullName}
                label="Name"
                style={{ marginBottom: 10 }}
                onChange={(e) => setFullName(e.currentTarget.value)}
              />
              <TextField
                value={email}
                label="Email"
                style={{ marginInline: 10 }}
                onChange={(e) => setEmail(e.currentTarget.value)}
              />
            </div>
            <div className={styles.section}>
              <Autocomplete
                sx={{ width: 300 }}
                options={Object.keys(config.availability)}
                getOptionLabel={(option) => option}
                autoSelect={true}
                onChange={(e, v, r, d) => {
                  if (r === "selectOption") {
                    setWeekday(v);
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Weekday" margin="normal" />
                )}
                renderOption={(props, option, { inputValue }) => {
                  const matches = match(option, inputValue);
                  const parts = parse(option, matches);
                  return (
                    <li {...props}>
                      <div>
                        {parts.map((part, index) => (
                          <span
                            key={index}
                            style={{
                              fontWeight: part.highlight ? 700 : 400,
                            }}
                          >
                            {part.text}
                          </span>
                        ))}
                      </div>
                    </li>
                  );
                }}
              />
            </div>
            <div className={styles.section}>
              <Autocomplete
                sx={{ width: 300 }}
                options={
                  config.availability[weekday]?.map(
                    (slot) => slot.start_time
                  ) ?? []
                }
                onChange={(e, v, r, d) => {
                  if (r === "selectOption") {
                    setStart(v);
                  }
                }}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField {...params} label="Start Time" margin="normal" />
                )}
                renderOption={(props, option, { inputValue }) => {
                  const matches = match(option, inputValue);
                  const parts = parse(option, matches);
                  return (
                    <li {...props}>
                      <div>
                        {parts.map((part, index) => (
                          <span
                            key={index}
                            style={{
                              fontWeight: part.highlight ? 700 : 400,
                            }}
                          >
                            {part.text}
                          </span>
                        ))}
                      </div>
                    </li>
                  );
                }}
              />
              <Autocomplete
                sx={{ width: 300 }}
                options={
                  config.availability[weekday]?.map((slot) => slot.end_time) ??
                  []
                }
                onChange={(e, v, r, d) => {
                  if (r === "selectOption") {
                    setEnd(v);
                  }
                }}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="End Time"
                    margin="normal"
                    value={end}
                  />
                )}
                renderOption={(props, option, { inputValue }) => {
                  const matches = match(option, inputValue);
                  const parts = parse(option, matches);
                  return (
                    <li {...props}>
                      <div>
                        {parts.map((part, index) => (
                          <span
                            key={index}
                            style={{
                              fontWeight: part.highlight ? 700 : 400,
                            }}
                          >
                            {part.text}
                          </span>
                        ))}
                      </div>
                    </li>
                  );
                }}
              />
            </div>
            <Button
              type="submit"
              style={{ width: "15em", alignSelf: "center" }}
              variant="contained"
            >
              Book New Slot
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

const SlotDayRow = ({ day }) => {
  const [open, toggle] = useState(false);
  return (
    <TableBody>
      <TableRow>
        <TableCell>{day.toUpperCase()}</TableCell>
        <TableCell align="right">
          <Button onClick={() => toggle(!open)}>
            {!open ? "show" : "hide"}
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table size="small" aria-label="purchases">
              <TableHead>
                <TableRow>
                  <TableCell align="right">Start</TableCell>
                  <TableCell align="right">End</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {config.availability[day].map((slot) => (
                  <TableRow key={`${day} ${slot.start_time}`}>
                    <TableCell align="right">{slot.start_time}</TableCell>
                    <TableCell align="right">{slot.end_time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};
