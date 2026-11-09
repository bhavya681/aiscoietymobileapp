export type OpenUIPrimitive = string | number | boolean | null;

export type OpenUIObject = {
  [key: string]: ResolvedOpenUIValue;
};

export type OpenUIExpr =
  | { kind: "literal"; value: OpenUIPrimitive }
  | { kind: "ref"; name: string }
  | { kind: "array"; items: OpenUIExpr[] }
  | { kind: "call"; name: string; args: OpenUIExpr[] };

export type ResolvedOpenUIValue =
  | OpenUIPrimitive
  | ResolvedOpenUIValue[]
  | OpenUIObject
  | {
      kind: "element";
      name: string;
      args: ResolvedOpenUIValue[];
    };

export type OpenUIProgram = {
  root: OpenUIExpr;
  env: Record<string, OpenUIExpr>;
  warnings: string[];
};
