export interface Context {
  req: any;
  res: any;
  dataLoaders: any;
}

export function createContext({ req, res, dataLoaders }: { req: any; res: any; dataLoaders: any }): Context {
  return {
    req,
    res,
    dataLoaders
  };
} 