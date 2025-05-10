/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_SERVER_URL: string;
    // add more env variables here if needed
  }
}
