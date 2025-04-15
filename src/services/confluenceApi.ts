import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE || "";

export interface SearchResult {
  results: Array<
    Partial<{
      content: {
        id: string;
        type: string;
        status: string;
        title: string;
        space: {
          key: string;
          name: string;
          type: string;
          status: string;
          _expandable: Record<string, unknown>;
          _links: Record<string, unknown>;
        };
        history: {
          latest: boolean;
        };
        version: {
          when: string;
          number: number;
          minorEdit: boolean;
        };
        ancestors: unknown[];
        operations: Array<{
          operation: string;
          targetType: string;
        }>;
        children: Record<string, unknown>;
        childTypes: Record<string, unknown>;
        descendants: Record<string, unknown>;
        container: Record<string, unknown>;
        body: {
          view: {
            value: string;
            representation: string;
          };
          export_view: {
            value: string;
            representation: string;
          };
          styled_view: {
            value: string;
            representation: string;
          };
          storage: {
            value: string;
            representation: string;
          };
          wiki: {
            value: string;
            representation: string;
          };
          editor: {
            value: string;
            representation: string;
          };
          editor2: {
            value: string;
            representation: string;
          };
          anonymous_export_view: {
            value: string;
            representation: string;
          };
          atlas_doc_format: {
            value: string;
            representation: string;
          };
          dynamic: {
            value: string;
            representation: string;
          };
          raw: {
            value: string;
            representation: string;
          };
          _expandable: Record<string, string>;
        };
        restrictions: {
          read: {
            operation: string;
            _expandable: Record<string, unknown>;
            _links: Record<string, unknown>;
          };
          update: {
            operation: string;
            _expandable: Record<string, unknown>;
            _links: Record<string, unknown>;
          };
          _expandable: Record<string, string>;
          _links: Record<string, unknown>;
        };
        metadata: Record<string, unknown>;
        macroRenderedOutput: Record<string, unknown>;
        extensions: Record<string, unknown>;
        _expandable: Record<string, string>;
        _links: Record<string, unknown>;
      };
      user: {
        type: string;
        username: string;
        userKey: string;
        accountId: string;
        accountType: string;
        email: string;
        publicName: string;
        profilePicture: {
          path: string;
          width: number;
          height: number;
          isDefault: boolean;
        };
        displayName: string;
        timeZone: string;
        externalCollaborator: boolean;
        isExternalCollaborator: boolean;
        isGuest: boolean;
        operations: Array<{
          operation: string;
          targetType: string;
        }>;
        details: Record<string, unknown>;
        personalSpace: {
          key: string;
          name: string;
          type: string;
          status: string;
          _expandable: Record<string, unknown>;
          _links: Record<string, unknown>;
        };
        _expandable: Record<string, string>;
        _links: Record<string, unknown>;
      };
      space: {
        id: number;
        key: string;
        alias: string;
        name: string;
        icon: {
          path: string;
          width: number;
          height: number;
          isDefault: boolean;
        };
        description: {
          plain: {
            value: string;
            representation: string;
            embeddedContent: unknown[];
          };
          view: {
            value: string;
            representation: string;
            embeddedContent: unknown[];
          };
          _expandable: Record<string, string>;
        };
        homepage: {
          type: string;
          status: string;
        };
        type: string;
        metadata: {
          labels: {
            results: Array<{
              prefix: string;
              name: string;
              id: string;
              label: string;
            }>;
            size: number;
          };
          _expandable: Record<string, unknown>;
        };
        operations: Array<{
          operation: string;
          targetType: string;
        }>;
        permissions: Array<{
          operation: {
            operation: string;
            targetType: string;
          };
          anonymousAccess: boolean;
          unlicensedAccess: boolean;
        }>;
        status: string;
        settings: {
          routeOverrideEnabled: boolean;
          _links: Record<string, unknown>;
        };
        theme: {
          themeKey: string;
        };
        lookAndFeel: {
          headings: {
            color: string;
          };
          links: {
            color: string;
          };
          menus: {
            hoverOrFocus: {
              backgroundColor: string;
            };
            color: string;
          };
          header: {
            backgroundColor: string;
            button: {
              backgroundColor: string;
              color: string;
            };
            primaryNavigation: {
              color: string;
              hoverOrFocus: {
                backgroundColor: string;
                color: string;
              };
            };
            secondaryNavigation: {
              color: string;
              hoverOrFocus: {
                backgroundColor: string;
                color: string;
              };
            };
            search: {
              backgroundColor: string;
              color: string;
            };
          };
          content: Record<string, unknown>;
          bordersAndDividers: {
            color: string;
          };
        };
        history: {
          createdDate: string;
          createdBy: {
            type: string;
          };
        };
        _expandable: Record<string, string>;
        _links: Record<string, unknown>;
      };
      title: string;
      excerpt: string;
      url: string;
      resultParentContainer: {
        title: string;
        displayUrl: string;
      };
      resultGlobalContainer: {
        title: string;
        displayUrl: string;
      };
      breadcrumbs: Array<{
        label: string;
        url: string;
        separator: string;
      }>;
      entityType: string;
      iconCssClass: string;
      lastModified: string;
      friendlyLastModified: string;
      score: number;
    }>
  >;
  start: number;
  limit: number;
  size: number;
  totalSize: number;
  cqlQuery: string;
  searchDuration: number;
  archivedResultCount: number;
  _links: Record<string, unknown>;
  nextCursor?: string;
}

export interface PageContent {
  id: string;
  status: string;
  title: string;
  body: {
    styled_view: {
      value: string;
    };
  };
}

export interface SearchParams {
  auth: string;
  cql: string;
  domain: string;
  limit?: number;
  cursor?: string;
  start?: number;
}

export const searchConfluence = async (
  params: SearchParams
): Promise<SearchResult> => {
  const { auth, cql, domain, limit, cursor, start } = params;
  const queryParams: Record<string, unknown> = { cql, domain };

  if (limit) {
    queryParams.limit = limit;
  }

  if (cursor) {
    queryParams.cursor = cursor;
  }

  if (start) {
    queryParams.start = start;
  }

  const response = await axios.get(`${BASE_URL}/api/search`, {
    params: queryParams,
    headers: {
      Authorization: auth,
      Accept: "application/json",
    },
  });
  return response.data;
};

export const getPageById = async (
  auth: string,
  pageId: string,
  domain: string
): Promise<PageContent> => {
  const response = await axios.get(`${BASE_URL}/api/pages/${pageId}`, {
    params: { domain },
    headers: {
      Authorization: auth,
      Accept: "application/json",
    },
  });
  return response.data;
};
