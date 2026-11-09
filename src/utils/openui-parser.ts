import type {
  OpenUIExpr,
  OpenUIPrimitive,
  OpenUIProgram,
  ResolvedOpenUIValue,
} from "@/types/openui";

/**
 * A deliberately small, safe parser for the OpenUI Lang subset emitted by the
 * SocietyAI backend.
 *
 * SECURITY: this parser never evaluates JavaScript. It recognises literals,
 * references, arrays and component calls, and the renderer only maps the
 * allow-listed component names to native React Native views. Anything unknown
 * is rendered as plain text. Model output can therefore never execute code.
 *
 * Supported grammar:
 *
 *   program   := statement (NEWLINE statement)*
 *   statement := IDENT "=" expr
 *   expr      := string | number | boolean | null | IDENT | array | call
 *   array     := "[" (expr ("," expr)*)? "]"
 *   call      := IDENT "(" (expr ("," expr)*)? ")"
 */

class OpenUIParseError extends Error {}

type Cursor = {
  source: string;
  index: number;
};

function isIdentifierStart(char: string): boolean {
  return /[A-Za-z_$]/.test(char);
}

function isIdentifierPart(char: string): boolean {
  return /[A-Za-z0-9_$]/.test(char);
}

function skipWhitespace(cursor: Cursor) {
  while (cursor.index < cursor.source.length) {
    const char = cursor.source[cursor.index];

    if (char === " " || char === "\t" || char === "\r" || char === "\n") {
      cursor.index += 1;
      continue;
    }

    break;
  }
}

function parseStringLiteral(cursor: Cursor): string {
  const quote = cursor.source[cursor.index];
  const start = cursor.index;
  cursor.index += 1;

  while (cursor.index < cursor.source.length) {
    const char = cursor.source[cursor.index];

    if (char === "\\") {
      cursor.index += 2;
      continue;
    }

    if (char === quote) {
      cursor.index += 1;
      const raw = cursor.source.slice(start, cursor.index);

      if (quote === '"') {
        try {
          return JSON.parse(raw) as string;
        } catch {
          // Fall through to the tolerant decoder below.
        }
      }

      return decodeEscapes(raw.slice(1, -1));
    }

    cursor.index += 1;
  }

  throw new OpenUIParseError("Unterminated string literal");
}

function decodeEscapes(value: string): string {
  return value.replace(/\\(n|r|t|"|'|\\|u[0-9a-fA-F]{4})/g, (_, code: string) => {
    switch (code) {
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      case '"':
        return '"';
      case "'":
        return "'";
      case "\\":
        return "\\";
      default:
        if (code.startsWith("u")) {
          return String.fromCharCode(Number.parseInt(code.slice(1), 16));
        }

        return code;
    }
  });
}

function parseNumber(cursor: Cursor): number {
  const start = cursor.index;

  if (cursor.source[cursor.index] === "-") {
    cursor.index += 1;
  }

  while (/[0-9]/.test(cursor.source[cursor.index] ?? "")) {
    cursor.index += 1;
  }

  if (cursor.source[cursor.index] === ".") {
    cursor.index += 1;

    while (/[0-9]/.test(cursor.source[cursor.index] ?? "")) {
      cursor.index += 1;
    }
  }

  if (
    cursor.source[cursor.index] === "e" ||
    cursor.source[cursor.index] === "E"
  ) {
    cursor.index += 1;

    if (
      cursor.source[cursor.index] === "+" ||
      cursor.source[cursor.index] === "-"
    ) {
      cursor.index += 1;
    }

    while (/[0-9]/.test(cursor.source[cursor.index] ?? "")) {
      cursor.index += 1;
    }
  }

  const raw = cursor.source.slice(start, cursor.index);
  const value = Number(raw);

  if (!Number.isFinite(value)) {
    throw new OpenUIParseError(`Invalid number "${raw}"`);
  }

  return value;
}

function parseIdentifier(cursor: Cursor): string {
  const start = cursor.index;

  cursor.index += 1;

  while (isIdentifierPart(cursor.source[cursor.index] ?? "")) {
    cursor.index += 1;
  }

  return cursor.source.slice(start, cursor.index);
}

function parseExpression(cursor: Cursor): OpenUIExpr {
  skipWhitespace(cursor);

  const char = cursor.source[cursor.index];

  if (char === undefined) {
    throw new OpenUIParseError("Unexpected end of input");
  }

  if (char === '"' || char === "'") {
    return { kind: "literal", value: parseStringLiteral(cursor) };
  }

  if (char === "[") {
    cursor.index += 1;
    const items: OpenUIExpr[] = [];

    skipWhitespace(cursor);

    if (cursor.source[cursor.index] === "]") {
      cursor.index += 1;
      return { kind: "array", items };
    }

    while (cursor.index < cursor.source.length) {
      items.push(parseExpression(cursor));
      skipWhitespace(cursor);

      const next = cursor.source[cursor.index];

      if (next === ",") {
        cursor.index += 1;
        continue;
      }

      if (next === "]") {
        cursor.index += 1;
        return { kind: "array", items };
      }

      throw new OpenUIParseError(`Expected "," or "]" but found "${next ?? "EOF"}"`);
    }

    throw new OpenUIParseError("Unterminated array");
  }

  if (char === "{" || char === "}") {
    throw new OpenUIParseError("Object literals are not supported");
  }

  if (char === "-" || /[0-9]/.test(char)) {
    return { kind: "literal", value: parseNumber(cursor) };
  }

  if (isIdentifierStart(char)) {
    const name = parseIdentifier(cursor);
    skipWhitespace(cursor);

    if (cursor.source[cursor.index] === "(") {
      cursor.index += 1;
      const args: OpenUIExpr[] = [];

      skipWhitespace(cursor);

      if (cursor.source[cursor.index] === ")") {
        cursor.index += 1;
        return { kind: "call", name, args };
      }

      while (cursor.index < cursor.source.length) {
        args.push(parseExpression(cursor));
        skipWhitespace(cursor);

        const next = cursor.source[cursor.index];

        if (next === ",") {
          cursor.index += 1;
          continue;
        }

        if (next === ")") {
          cursor.index += 1;
          return { kind: "call", name, args };
        }

        throw new OpenUIParseError(
          `Expected "," or ")" but found "${next ?? "EOF"}"`
        );
      }

      throw new OpenUIParseError("Unterminated component call");
    }

    if (name === "true" || name === "false" || name === "null") {
      const literal: OpenUIPrimitive =
        name === "null" ? null : name === "true";

      return { kind: "literal", value: literal };
    }

    return { kind: "ref", name };
  }

  throw new OpenUIParseError(`Unexpected character "${char}"`);
}

/** Split a program into statements while respecting strings and brackets. */
function splitStatements(source: string): string[] {
  const statements: string[] = [];
  let current = "";
  let depth = 0;
  let quote: string | null = null;
  let escaped = false;

  for (const char of source) {
    if (quote) {
      current += char;

      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "[" || char === "(") {
      depth += 1;
      current += char;
      continue;
    }

    if (char === "]" || char === ")") {
      depth = Math.max(0, depth - 1);
      current += char;
      continue;
    }

    if ((char === "\n" || char === ";") && depth === 0) {
      if (current.trim()) {
        statements.push(current.trim());
      }

      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

function findAssignment(statement: string): { name: string; expr: string } | null {
  let quote: string | null = null;
  let escaped = false;
  let depth = 0;

  for (let index = 0; index < statement.length; index += 1) {
    const char = statement[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === "[" || char === "(") {
      depth += 1;
      continue;
    }

    if (char === "]" || char === ")") {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (char === "=" && depth === 0) {
      const name = statement.slice(0, index).trim();
      const expr = statement.slice(index + 1).trim();

      if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) || !expr) {
        return null;
      }

      return { name, expr };
    }
  }

  return null;
}

export function stripCodeFences(source: string): string {
  const trimmed = source.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```[a-zA-Z]*\s*/, "")
    .replace(/```\s*$/, "")
    .trim();
}

export function parseOpenUI(source?: string | null): OpenUIProgram | null {
  if (!source || !source.trim()) {
    return null;
  }

  const cleaned = stripCodeFences(source);
  const env: Record<string, OpenUIExpr> = {};
  const warnings: string[] = [];

  for (const statement of splitStatements(cleaned)) {
    if (!statement || statement.startsWith("//") || statement.startsWith("#")) {
      continue;
    }

    const assignment = findAssignment(statement);

    if (!assignment) {
      warnings.push(`Skipped unrecognised statement: ${statement.slice(0, 80)}`);
      continue;
    }

    const cursor: Cursor = { source: assignment.expr, index: 0 };

    try {
      const expr = parseExpression(cursor);
      skipWhitespace(cursor);

      if (cursor.index < cursor.source.length) {
        warnings.push(
          `Ignored trailing content in "${assignment.name}": ${cursor.source
            .slice(cursor.index)
            .slice(0, 60)}`
        );
      }

      env[assignment.name] = expr;
    } catch (error) {
      warnings.push(
        `Could not parse "${assignment.name}": ${
          error instanceof Error ? error.message : "unknown error"
        }`
      );
    }
  }

  const root = env.root ?? Object.values(env)[0];

  if (!root) {
    return null;
  }

  return { root, env, warnings };
}

export function resolveOpenUIValue(
  expr: OpenUIExpr,
  env: Record<string, OpenUIExpr>,
  depth = 0
): ResolvedOpenUIValue {
  if (depth > 24) {
    return "[nested value]";
  }

  switch (expr.kind) {
    case "literal":
      return expr.value;

    case "ref": {
      const referenced = env[expr.name];

      if (!referenced) {
        // Bare words such as tone tokens are common and safe to surface.
        return expr.name;
      }

      return resolveOpenUIValue(referenced, env, depth + 1);
    }

    case "array":
      return expr.items.map((item) => resolveOpenUIValue(item, env, depth + 1));

    case "call":
      return {
        kind: "element",
        name: expr.name,
        args: expr.args.map((arg) => resolveOpenUIValue(arg, env, depth + 1)),
      };

    default:
      return null;
  }
}

export function resolveOpenUIProgram(program: OpenUIProgram): ResolvedOpenUIValue {
  return resolveOpenUIValue(program.root, program.env);
}
