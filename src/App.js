import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  AppBar,
  Toolbar,
  Button,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  DataGridPro,
  GridColumnMenu,
  useGridApiContext,
  gridColumnDefinitionsSelector,
  GridCellEditStopReasons,
  useGridApiRef,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid-pro";
import {
  Info,
  AlignHorizontalLeft,
  AlignHorizontalRight,
  FileCopy,
  Delete,
  Add,
  Save,
} from "@mui/icons-material";
import { LicenseInfo } from "@mui/x-license-pro";
import { v4 as uuidv4 } from "uuid";
const App = () => {
  LicenseInfo.setLicenseKey(
    "6b1cacb920025860cc06bcaf75ee7a66Tz05NDY2MixFPTE3NTMyNTMxMDQwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
  );

  const title = "Edit Local Storage",
    apiRef = useGridApiRef(),
    fontSize = 14,
    innerHeight = window.innerHeight,
    // urlPrefix = window.location.protocol + "//" + window.location.host,
    // { href } = window.location,
    // mode = href.startsWith("http://localhost") ? "local" : "remote",
    // server = href.split("//")[1].split("/")[0],
    // webDavPrefix = urlPrefix + "/lsaf/webdav/repo",
    // fileViewerPrefix = `https://${server}/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=`,
    [openInfo, setOpenInfo] = useState(false),
    [rows, setRows] = useState(null),
    cols = [
      { field: "key", headerName: "Key", editable: true },
      {
        field: "path",
        headerName: "Path",
        editable: true,
        width: 400,
        flex: 1,
      },
    ],
    CustomToolbar = () => {
      return (
        <GridToolbarContainer>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <GridToolbarExport />

          <Box sx={{ flexGrow: 1 }} />
          <GridToolbarQuickFilter />
        </GridToolbarContainer>
      );
    },
    Align = (props) => {
      const { myCustomHandler, align } = props;
      return (
        <MenuItem onClick={myCustomHandler}>
          <ListItemIcon>
            {align === "left" ? (
              <AlignHorizontalLeft fontSize="small" />
            ) : (
              <AlignHorizontalRight fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>{align}</ListItemText>
        </MenuItem>
      );
    },
    CustomColumnMenu = (props) => {
      const apiRef = useGridApiContext();
      return (
        <GridColumnMenu
          {...props}
          slots={{
            right: Align,
            left: Align,
          }}
          slotProps={{
            right: {
              align: "right",
              myCustomHandler: (e) => {
                const c = gridColumnDefinitionsSelector(apiRef);
                c.forEach((col) => {
                  col.headerAlign = "right";
                  col.align = "right";
                });
                // apiRef.current.align("", "right");
              },
            },
            left: {
              align: "left",
              myCustomHandler: (e) => {
                const c = gridColumnDefinitionsSelector(apiRef);
                c.forEach((col) => {
                  col.headerAlign = "left";
                  col.align = "left";
                });
                // apiRef.current.align("", "right");
              },
            },
          }}
        />
      );
    },
    isKeyboardEvent = (event) => {
      return !!event.key;
    },
    editingRow = useRef(null),
    handleCellEditStart = (params) => {
      editingRow.current = rows.find((row) => row.id === params.id) || null;
    },
    handleCellEditStop = (params, event) => {
      if (params.reason === GridCellEditStopReasons.escapeKeyDown) {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === editingRow.current?.id
              ? { ...row, account: editingRow.current?.account }
              : row
          )
        );
      }
      if (params.reason !== GridCellEditStopReasons.enterKeyDown) {
        return;
      }
      if (isKeyboardEvent(event) && !event.ctrlKey && !event.metaKey) {
        event.defaultMuiPrevented = true;
      }
    },
    processRowUpdate = (newRow) => {
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === newRow?.id ? newRow : row))
      );
      return newRow;
    },
    addRecord = (e) => {
      const id = uuidv4();
      let newRow = { id: id };
      if (rows.length > 0) {
        const row0 = rows[0];
        Object.keys(row0).forEach((index) => {
          newRow[index] = ".";
        });
        newRow.id = id;
      }
      // console.log("rows", rows, "newRow", newRow);
      setRows([...rows, newRow]);
    },
    deleteRecord = (e) => {
      // setRows((oldRows) => [...oldRows, { id: id }]);
      const selected = apiRef.current.getSelectedRows();
      for (const key of selected.keys()) {
        setRows((oldRows) => oldRows.filter((row) => row.id !== key));
      }
    },
    duplicateRecord = (e) => {
      const selected = apiRef.current.getSelectedRows();
      const extraRows = [];
      for (const key of selected.keys()) {
        const dup = rows.filter((row) => row.id === key);
        extraRows.push({ ...dup[0], id: uuidv4() });
      }
      setRows([...rows, ...extraRows]);
    };

  useEffect(() => {
    // get any links that are defined in local storage
    let tempRows = [];
    if ("lsafLinks" in localStorage) {
      const a = JSON.parse(localStorage.getItem("lsafLinks"));
      tempRows = Object.keys(a).map((key, id) => {
        return { key: key, path: a[key], id: id };
      });
    } else tempRows = [{ key: "c", path: "/clinical", id: 0 }];
    setRows(tempRows);
    console.log("tempRows", tempRows);

    // localStorage.setItem(
    //   "lsafLinks",
    //   JSON.stringify({ a: "/clinical", b: "/general" })
    // );
  }, []);

  return (
    <>
      <AppBar position="fixed">
        <Toolbar variant="dense" sx={{ backgroundColor: "#f7f7f7" }}>
          <Box
            sx={{
              border: 1,
              borderRadius: 2,
              color: "black",
              fontWeight: "bold",
              boxShadow: 3,
              fontSize: 14,
              height: 23,
              padding: 0.3,
            }}
          >
            &nbsp;&nbsp;{title}&nbsp;&nbsp;
          </Box>
          <Tooltip title="Save JSON back to server">
            <span>
              <Button
                variant="contained"
                sx={{ m: 1, ml: 2, fontSize: 10 }}
                onClick={() => {
                  const out = {};
                  rows.forEach((row) => {
                    out[row.key] = row.path;
                  });
                  localStorage.setItem("lsafLinks", JSON.stringify(out));
                  console.log("SAVE - rows", rows, "out", out);
                }}
                size="small"
                color="success"
                startIcon={<Save sx={{ fontSize: 10 }} />}
              >
                Save
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            color="info"
            startIcon={<Add sx={{ fontSize: 10 }} />}
            onClick={addRecord}
            size="small"
            sx={{ m: 1, fontSize: 10 }}
          >
            Add
          </Button>
          <Button
            variant="contained"
            color="info"
            startIcon={<Delete sx={{ fontSize: 10 }} />}
            onClick={deleteRecord}
            size="small"
            sx={{ m: 1, fontSize: 10 }}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            color="info"
            startIcon={<FileCopy sx={{ fontSize: 10 }} />}
            onClick={duplicateRecord}
            size="small"
            sx={{ m: 1, fontSize: 10 }}
          >
            Duplicate
          </Button>
          <Box sx={{ flexGrow: 1 }}></Box>
          <Tooltip title="Information about this screen">
            <IconButton
              color="info"
              // sx={{ mr: 2 }}
              onClick={() => {
                setOpenInfo(true);
              }}
            >
              <Info />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Grid container>
        <Grid item xs={12}>
          <Box sx={{ height: innerHeight - 50, width: "100%" }}>
            {rows && (
              <DataGridPro
                autoHeight={true}
                rows={rows}
                columns={cols}
                rowHeight={30}
                density="compact"
                editMode="row"
                slots={{ columnMenu: CustomColumnMenu, toolbar: CustomToolbar }}
                onCellEditStart={handleCellEditStart}
                onCellEditStop={handleCellEditStop}
                processRowUpdate={processRowUpdate}
                apiRef={apiRef}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                  },
                }}
                sx={{
                  width: window.innerWidth,
                  height: window.innerHeight - 50,
                  fontWeight: `fontSize=5`,
                  fontSize: { fontSize },
                  padding: 1,
                  mt: 6,
                }}
              />
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Dialog with General info about this screen */}
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={() => setOpenInfo(false)}
        open={openInfo}
      >
        <DialogTitle>Info about this screen</DialogTitle>
        <DialogContent>
          <Box sx={{ color: "blue", fontSize: 11 }}>
            <ol>
              <li>Any existing values will be loaded first.</li>
              <li>Double click a row to edit it.</li>
              <li>Assign a different key to each path in LSAF.</li>
              <li>Press save button to save back to localStorage.</li>
              <li>Use the bookmarklet to use the shortcuts.</li>
              <li>
                When using the bookmarklet you should have already selected the
                repository or workspace view in LSAF.
              </li>
            </ol>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default App;
