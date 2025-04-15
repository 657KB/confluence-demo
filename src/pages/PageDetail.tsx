import { useParams, useLocation, useNavigate } from "react-router";
import {
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import { getPageById } from "../services/confluenceApi";
import { useQuery } from "@tanstack/react-query";

import styles from "../styles/page.module.scss";
import { useEffect } from "react";

const convertUnicodeEscapes = (html: string): string => {
  return html.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
};

const processHighlightedElements = (html: string): string => {
  return html.replace(
    /<([^>]+)data-highlight-colour="([^"]+)"([^>]*)>/g,
    (match, before, color, after) => {
      if (before.includes("style=") || after.includes("style=")) {
        return match.replace(/style="([^"]*)"/g, (styleMatch, styleValue) => {
          if (!styleValue.includes("background-color:")) {
            return `style="${styleValue} background-color: ${color};"`;
          }
          return styleMatch;
        });
      } else {
        return `<${before}style="background-color: ${color};"${after}>`;
      }
    }
  );
};

export default function PageDetail() {
  const { pageId } = useParams<{ pageId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Get auth and domain from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const auth = searchParams.get("auth");
  const domain = searchParams.get("domain");

  const {
    data: page,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["page", pageId],
    queryFn: () => {
      if (!pageId || !auth || !domain) {
        throw new Error("Missing required information");
      }
      return getPageById(auth, pageId, domain);
    },
    enabled: !!pageId && !!auth && !!domain,
  });

  useEffect(() => {
    if (page) {
      document.title = page.title;
    }
  }, [page]);

  if (isLoading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography color="error">
          {(error as Error).message || "Failed to load page content"}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{ mt: 2 }}
        >
          Back to Search
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {page && (
        <Paper className={styles.content}>
          <Typography className={styles.title} variant="h4" component="h1">
            {page.title}
          </Typography>
          <Box
            sx={{
              "& img": { maxWidth: "100%" },
              "& a": { color: "primary.main" },
            }}
            dangerouslySetInnerHTML={{
              __html: processHighlightedElements(
                convertUnicodeEscapes(page.body.styled_view.value)
              ),
            }}
          />
        </Paper>
      )}
    </Container>
  );
}
