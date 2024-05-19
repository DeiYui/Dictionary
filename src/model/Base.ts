import http from "@/utils/api/http";

export const API_ROOT = "https://wetalk.ibme.edu.vn";

export class Base {
  private readonly apiRoot: string | undefined;
  private readonly apiPrefix: string | undefined;

  constructor(apiPrefix: string | null = null) {
    this.apiRoot = API_ROOT;
    this.apiPrefix = `${API_ROOT}/${apiPrefix}`;
  }

  normalizeQuery = (query: { [x: string]: any }) => {
    const formatQuery: Record<string, any> = {};
    Object.keys(query).forEach((key) => {
      if (query[key]) {
        if (typeof query[key] === "string") {
          formatQuery[key] = query[key].trim();
        } else if (!Number.isNaN(query[key])) {
          formatQuery[key] = query[key];
        }
      }
    });

    return formatQuery;
  };

  apiGet = (url: string, query = {}, signal?: any) =>
    http.get(`${this.apiPrefix}${url}`, {
      params: this.normalizeQuery(query),
      signal,
    });

  apiGetWithoutPrefix = (url: string, query = {}, signal?: any) =>
    http.get(`${this.apiRoot}${url}`, {
      params: this.normalizeQuery(query),
      signal,
    });

  apiPost = (url: string, body: any, signal?: any) =>
    http.post(`${this.apiPrefix}${url}`, body, { signal });

  apiPut = (url: string, body: any, signal?: any) =>
    http.put(`${this.apiPrefix}${url}`, body, { signal });

  apiPutWithoutPrefix = (url: any, body?: any, signal?: any) =>
    http.put(`${this.apiRoot}${url}`, body, { signal });

  apiPostWithoutPrefix = (url: string, body: any, signal?: any) =>
    http.post(`${this.apiRoot}${url}`, body, { signal });

  apiDelete = (url = {}, signal?: any) =>
    http.delete(`${this.apiPrefix}${url}`, { signal });

  apiDeleteWithoutPrefix = (url = {}, signal?: any) =>
    http.delete(`${this.apiRoot}${url}`, { signal });

  apiUploadFile = (url: string, body: any, signal?: any) =>
    http.post(`${this.apiRoot}${url}`, body, {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
    });

  apiPostUpload = (url: string, body: any) =>
    http.post(`${this.apiRoot}${url}`, body, {
      headers: {
        "Content-Type":
          "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
      },
      responseType: "blob",
    });
}