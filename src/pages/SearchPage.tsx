import {
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
} from "@mui/material";
import { useConfluenceSearch } from "../hooks/useConfluenceSearch";
import { useEffect, useState, useRef } from "react";

export default function SearchPage() {
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    email: "",
    apiToken: "",
    domain: "",
    cql: "",
  });

  const [auth, setAuth] = useState("");
  const [pageSize, setPageSize] = useState(50);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [prevCursors, setPrevCursors] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const {
    mutate: search,
    data: searchResults,
    isPending,
    error,
  } = useConfluenceSearch();

  useEffect(() => {
    try {
      const email = localStorage.getItem("confluence_email") || "";
      const apiToken = localStorage.getItem("confluence_api_token") || "";
      const domain = localStorage.getItem("confluence_domain") || "";
      const cql = localStorage.getItem("confluence_cql") || "";

      setFormData({
        email,
        apiToken,
        domain,
        cql,
      });

      if (email && apiToken) {
        const authString = `Basic ${btoa(`${email}:${apiToken}`)}`;
        setAuth(authString);
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  // Automatically generate auth when email or apiToken changes
  useEffect(() => {
    if (formData.email && formData.apiToken) {
      const authString = `Basic ${btoa(
        `${formData.email}:${formData.apiToken}`
      )}`;
      setAuth(authString);
    } else {
      setAuth("");
    }
  }, [formData.email, formData.apiToken]);

  // Update nextCursor when search results change
  useEffect(() => {
    if (searchResults) {
      setNextCursor(searchResults.nextCursor);
    }
  }, [searchResults]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setHasSearched(true);

    const form = formRef.current;
    if (!form) return;

    const formElements = form.elements as HTMLFormControlsCollection;
    const email =
      (formElements.namedItem("email") as HTMLInputElement)?.value || "";
    const apiToken =
      (formElements.namedItem("apiToken") as HTMLInputElement)?.value || "";
    const domain =
      (formElements.namedItem("domain") as HTMLInputElement)?.value || "";
    const cql =
      (formElements.namedItem("cql") as HTMLInputElement)?.value || "";

    setFormData({
      email,
      apiToken,
      domain,
      cql,
    });

    localStorage.setItem("confluence_email", email);
    localStorage.setItem("confluence_api_token", apiToken);
    localStorage.setItem("confluence_domain", domain);
    localStorage.setItem("confluence_cql", cql);

    if (!email) {
      setValidationError("Please enter email address");
      return;
    }
    if (!apiToken) {
      setValidationError("Please enter API token");
      return;
    }
    if (!domain) {
      setValidationError("Please enter domain prefix");
      return;
    }
    if (!cql) {
      setValidationError("Please enter CQL query");
      return;
    }

    setValidationError(null);
    setPrevCursors([]);
    setNextCursor(undefined);

    search({ auth, cql, domain, limit: pageSize });
  };

  const handleNextPage = () => {
    if (nextCursor) {
      setIsPaginationLoading(true);
      setPrevCursors([...prevCursors, nextCursor]);
      search({
        auth,
        cql: formData.cql,
        domain: formData.domain,
        limit: pageSize,
        cursor: nextCursor,
      });
    }
  };

  const handlePrevPage = () => {
    if (prevCursors.length > 0) {
      setIsPaginationLoading(true);
      const newPrevCursors = [...prevCursors];
      const prevCursor = newPrevCursors.pop();
      setPrevCursors(newPrevCursors);

      if (prevCursor) {
        search({
          auth,
          cql: formData.cql,
          domain: formData.domain,
          limit: pageSize,
          cursor: prevCursor,
        });
      }
    }
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newPageSize = event.target.value as number;
    setPageSize(newPageSize);
    setPrevCursors([]);
    setNextCursor(undefined);
    setIsPaginationLoading(true);
    search({
      auth,
      cql: formData.cql,
      domain: formData.domain,
      limit: newPageSize,
    });
  };

  const handlePageClick = (pageId?: string) => {
    if (pageId) {
      const url = `/page/${pageId}?auth=${encodeURIComponent(
        auth
      )}&domain=${encodeURIComponent(formData.domain)}`;
      window.open(url, "_blank");
    } else {
      alert("🚫 It is not a page.");
    }
  };

  // Use search results directly
  const displayResults = !hasSearched ? null : searchResults;

  // Reset pagination loading state when search results are updated
  useEffect(() => {
    if (searchResults) {
      setIsPaginationLoading(false);
    }
  }, [searchResults]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Confluence Demo
        </Typography>
        {validationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
        )}
        <form ref={formRef} onSubmit={handleSearch}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            defaultValue={formData.email}
            margin="normal"
            type="email"
            required
            error={validationError === "Please enter email address"}
          />
          <TextField
            fullWidth
            label="API Token"
            name="apiToken"
            defaultValue={formData.apiToken}
            margin="normal"
            type="password"
            required
            error={validationError === "Please enter API token"}
          />
          <TextField
            fullWidth
            label="Domain Prefix"
            name="domain"
            defaultValue={formData.domain}
            margin="normal"
            placeholder="exegydev"
            helperText="Enter your Atlassian domain prefix (e.g., exegydev for exegydev.atlassian.net)"
            required
            error={validationError === "Please enter domain prefix"}
          />
          <TextField
            fullWidth
            label="CQL Query"
            name="cql"
            defaultValue={formData.cql}
            margin="normal"
            placeholder='type = page AND text ~ "MAMA"'
            required
            error={validationError === "Please enter CQL query"}
          />
          <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 2 }}>
            <FormControl sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel id="page-size-label">Results per page</InputLabel>
              <Select
                labelId="page-size-label"
                value={pageSize}
                label="Results per page"
                onChange={handlePageSizeChange}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              sx={{ flexGrow: 1, height: "56px", fontSize: "1.1rem" }}
              disabled={isPending}
            >
              {isPending && !isPaginationLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Search"
              )}
            </Button>
          </Box>
        </form>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mb: 3 }}>
          {(error as unknown as { response: { data: { error: string } } })
            .response.data.error || "Unknown error occurred"}
        </Typography>
      )}

      {displayResults && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Search Results ({displayResults.totalSize} total)
          </Typography>
          <Box sx={{ position: "relative" }}>
            {isPaginationLoading && !error && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  zIndex: 1,
                }}
              >
                <CircularProgress />
              </Box>
            )}
            <List sx={{ opacity: isPaginationLoading && !error ? 0.5 : 1 }}>
              {displayResults.results.map((result) => (
                <ListItem
                  key={result.content?.id}
                  component="button"
                  onClick={() =>
                    !isPaginationLoading && handlePageClick(result.content?.id)
                  }
                  sx={{
                    border: "1px solid var(--border-color)",
                    mb: 1,
                    borderRadius: 1,
                    transition:
                      "background-color 0.2s ease, border-color 0.2s ease",
                    backgroundColor: "var(--paper-color)",
                    color: "var(--text-color)",
                    "&:hover": {
                      backgroundColor:
                        isPaginationLoading && !error
                          ? "inherit"
                          : "var(--hover-color)",
                      cursor:
                        isPaginationLoading && !error ? "default" : "pointer",
                    },
                    pointerEvents:
                      isPaginationLoading && !error ? "none" : "auto",
                  }}
                >
                  <ListItemText
                    primary={result.title}
                    secondary={`Type: ${
                      result.space ? "space" : result.content?.type
                    }`}
                    sx={{
                      "& .MuiListItemText-primary": {
                        color: "var(--text-color)",
                      },
                      "& .MuiListItemText-secondary": {
                        color: "var(--secondary-text-color)",
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {displayResults.totalSize > pageSize && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Button
                variant="outlined"
                onClick={handlePrevPage}
                disabled={prevCursors.length === 0 || isPaginationLoading}
              >
                Previous Page
              </Button>
              <Button
                variant="outlined"
                onClick={handleNextPage}
                disabled={!nextCursor || isPaginationLoading}
              >
                Next Page
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
}
