import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean;
    permission?: string;
  }
}

export {};
