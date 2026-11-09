import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  Info,
  Share2,
  ShieldCheck,
  XCircle,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/common/app-text";
import { Badge } from "@/components/common/badge";
import { fonts, type ThemeColors } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { ResolvedOpenUIValue } from "@/types/openui";
import { parseOpenUI, resolveOpenUIProgram } from "@/utils/openui-parser";

/**
 * Renders the OpenUI Lang programs returned by `/api/ai/chat`.
 *
 * The parser is intentionally non-executing, and this renderer has a closed
 * allow-list of components. Unknown components or malformed programs degrade
 * to readable text instead of crashing the chat.
 */

export function OpenUIRenderer({ source }: { source?: string | null }) {
  const program = useMemo(() => parseOpenUI(source), [source]);
  const value = useMemo(
    () => (program ? resolveOpenUIProgram(program) : null),
    [program]
  );

  if (!value) {
    return null;
  }

  return <View style={{ gap: 10 }}>{renderValue(value, "root")}</View>;
}

function renderValue(
  value: ResolvedOpenUIValue,
  key: string
): React.ReactNode {
  if (value === null || value === undefined || typeof value === "boolean") {
    return null;
  }

  if (typeof value === "string" || typeof value === "number") {
    return <TextBlock key={key} text={String(value)} />;
  }

  if (Array.isArray(value)) {
    return (
      <View key={key} style={{ gap: 10 }}>
        {value.map((item, index) => renderValue(item, `${key}-${index}`))}
      </View>
    );
  }

  if (isElement(value)) {
    return renderElement(value, key);
  }

  if (typeof value === "object") {
    const entries = Object.entries(value);

    return (
      <KeyValueList
        key={key}
        title={undefined}
        items={entries.map(([label, entry]) => ({
          label,
          value: stringify(entry),
          tone: undefined,
        }))}
      />
    );
  }

  return null;
}

function renderElement(
  node: Extract<ResolvedOpenUIValue, { kind: "element" }>,
  key: string
): React.ReactNode {
  const args = node.args;

  switch (node.name) {
    case "Answer":
      return (
        <View key={key} style={{ gap: 10 }}>
          {elementsOf(args[0]).map((child, index) =>
            renderValue(child, `${key}-${index}`)
          )}
        </View>
      );

    case "TextBlock":
      return <TextBlock key={key} text={text(args[0])} tone={tone(args[1])} />;

    case "Callout":
      return (
        <Callout
          key={key}
          text={text(args[0])}
          title={optionalText(args[1])}
          tone={tone(args[2])}
        />
      );

    case "Stat":
      return (
        <Stat
          key={key}
          label={text(args[0])}
          value={text(args[1])}
          hint={optionalText(args[2])}
          tone={tone(args[3])}
        />
      );

    case "StatGrid":
      return <StatGrid key={key} items={elementsOf(args[0])} />;

    case "KeyValueItem":
      return (
        <KeyValueRow
          key={key}
          label={text(args[0])}
          value={text(args[1])}
          tone={tone(args[2])}
        />
      );

    case "KeyValueList":
      return (
        <KeyValueList
          key={key}
          title={optionalText(args[1])}
          items={elementsOf(args[0]).map((item) => ({
            label: isElement(item) ? text(item.args[0]) : stringify(item),
            value: isElement(item) ? text(item.args[1]) : "",
            tone: isElement(item) ? tone(item.args[2]) : undefined,
          }))}
        />
      );

    case "Table":
      return (
        <Table
          key={key}
          columns={stringArray(args[0])}
          rows={rowsOf(args[1])}
          title={optionalText(args[2])}
        />
      );

    case "Artifact":
      return (
        <Artifact
          key={key}
          title={text(args[0])}
          kind={optionalText(args[1])}
          content={text(args[2])}
          description={optionalText(args[3])}
          language={optionalText(args[4])}
        />
      );

    case "Approval":
      return (
        <Approval
          key={key}
          title={text(args[0])}
          description={text(args[1])}
          amount={optionalText(args[2])}
          status={optionalText(args[3]) ?? "pending"}
          reference={optionalText(args[4])}
          note={optionalText(args[5])}
        />
      );

    case "TimelineItem":
      return (
        <Timeline
          key={key}
          title={undefined}
          items={[
            {
              title: text(args[0]),
              description: optionalText(args[1]),
              date: optionalText(args[2]),
              tone: tone(args[3]),
            },
          ]}
        />
      );

    case "Timeline":
      return (
        <Timeline
          key={key}
          title={optionalText(args[1])}
          items={elementsOf(args[0]).map((item) => ({
            title: isElement(item) ? text(item.args[0]) : "",
            description: isElement(item)
              ? optionalText(item.args[1])
              : undefined,
            date: isElement(item) ? optionalText(item.args[2]) : undefined,
            tone: isElement(item) ? tone(item.args[3]) : undefined,
          }))}
        />
      );

    case "Card":
      return (
        <BlockCard
          key={key}
          title={optionalText(args[1])}
          description={optionalText(args[2])}
        >
          {elementsOf(args[0]).map((child, index) =>
            renderValue(child, `${key}-${index}`)
          )}
        </BlockCard>
      );

    default: {
      const childElements = args.filter(isElement);

      if (childElements.length > 0) {
        return (
          <View key={key} style={{ gap: 10 }}>
            {childElements.map((child, index) =>
              renderValue(child, `${key}-u-${index}`)
            )}
          </View>
        );
      }

      const fallback = args.find((arg) => typeof arg === "string");

      return fallback ? (
        <TextBlock key={key} text={String(fallback)} />
      ) : null;
    }
  }
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

function TextBlock({
  text: content,
  tone: toneName,
}: {
  text: string;
  tone?: string;
}) {
  const { colors } = useAppTheme();
  const palette = tonePalette(toneName ?? "default", colors);

  if (!content) {
    return null;
  }

  return (
    <AppText variant="body" color={palette.foreground} style={{ lineHeight: 23 }}>
      <RichText text={content} color={palette.foreground} />
    </AppText>
  );
}

function RichText({ text: content, color }: { text: string; color: string }) {
  const { colors, radius } = useAppTheme();
  const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <AppText key={index} weight="700" color={color}>
              {part.slice(2, -2)}
            </AppText>
          );
        }

        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <AppText
              key={index}
              color={colors.primary}
              style={{
                fontFamily: fonts.mono,
                fontSize: 13,
                backgroundColor: colors.muted,
                borderRadius: radius.xs,
              }}
            >
              {` ${part.slice(1, -1)} `}
            </AppText>
          );
        }

        return <AppText key={index} color={color}>{part}</AppText>;
      })}
    </>
  );
}

function Callout({
  text: content,
  title,
  tone: toneName,
}: {
  text: string;
  title?: string;
  tone?: string;
}) {
  const { colors, radius, spacing } = useAppTheme();
  const palette = tonePalette(toneName ?? "info", colors);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: spacing.sm,
        backgroundColor: palette.background,
        borderColor: palette.border,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        padding: spacing.md,
      }}
    >
      <ToneIcon tone={toneName ?? "info"} color={palette.foreground} />
      <View style={{ flex: 1, gap: 2 }}>
        {title ? (
          <AppText variant="label" weight="700" color={palette.foreground}>
            {title}
          </AppText>
        ) : null}
        <AppText
          variant="bodySmall"
          color={palette.foreground}
          style={{ lineHeight: 20 }}
        >
          <RichText text={content} color={palette.foreground} />
        </AppText>
      </View>
    </View>
  );
}

function StatGrid({
  items,
}: {
  items: ResolvedOpenUIValue[];
}) {
  const visible = items.filter(isElement).filter((item) => item.name === "Stat");

  if (visible.length === 0) {
    return null;
  }

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {visible.map((item, index) => (
        <View
          key={index}
          style={{ flexBasis: visible.length === 1 ? "100%" : "46%", flexGrow: 1 }}
        >
          <Stat
            label={text(item.args[0])}
            value={text(item.args[1])}
            hint={optionalText(item.args[2])}
            tone={tone(item.args[3])}
          />
        </View>
      ))}
    </View>
  );
}

function Stat({
  label,
  value,
  hint,
  tone: toneName,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: string;
}) {
  const { colors, radius, spacing } = useAppTheme();
  const palette = tonePalette(toneName ?? "default", colors);

  return (
    <View
      style={{
        backgroundColor: palette.background,
        borderColor: palette.border,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        padding: spacing.md,
        gap: 2,
        minHeight: 82,
        justifyContent: "center",
      }}
    >
      <AppText
        variant="micro"
        weight="600"
        color={palette.foreground}
        style={{ opacity: 0.75 }}
        numberOfLines={1}
      >
        {label.toUpperCase()}
      </AppText>
      <AppText
        style={{
          fontSize: 20,
          lineHeight: 25,
          fontWeight: "700",
          letterSpacing: -0.5,
          color: palette.foreground,
        }}
        numberOfLines={2}
      >
        {value}
      </AppText>
      {hint ? (
        <AppText
          variant="micro"
          color={palette.foreground}
          style={{ opacity: 0.7 }}
          numberOfLines={2}
        >
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

function KeyValueList({
  items,
  title,
}: {
  items: { label: string; value: string; tone?: string }[];
  title?: string;
}) {
  const { colors, radius, spacing } = useAppTheme();

  if (items.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        borderColor: colors.border,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: colors.card,
        paddingHorizontal: spacing.md,
        paddingVertical: title ? spacing.sm : 0,
      }}
    >
      {title ? (
        <AppText
          variant="label"
          weight="700"
          style={{ paddingVertical: spacing.xs }}
        >
          {title}
        </AppText>
      ) : null}
      {items.map((item, index) => (
        <View key={`${item.label}-${index}`}>
          {index > 0 ? (
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: colors.border,
              }}
            />
          ) : null}
          <KeyValueRow {...item} />
        </View>
      ))}
    </View>
  );
}

function KeyValueRow({
  label,
  value,
  tone: toneName,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  const { colors, spacing } = useAppTheme();
  const palette = tonePalette(toneName ?? "default", colors);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: spacing.md,
        paddingVertical: spacing.sm,
      }}
    >
      <AppText variant="bodySmall" color={colors.mutedForeground} style={{ flex: 1 }}>
        {label}
      </AppText>
      <AppText
        variant="bodySmall"
        weight="600"
        color={palette.foreground}
        style={{ textAlign: "right", flexShrink: 1 }}
      >
        {value}
      </AppText>
    </View>
  );
}

function Table({
  columns,
  rows,
  title,
}: {
  columns: string[];
  rows: string[][];
  title?: string;
}) {
  const { colors, radius, spacing } = useAppTheme();
  const columnCount = Math.max(columns.length, 1);
  const columnWidth = columnCount > 3 ? 116 : 132;

  if (columns.length === 0 && rows.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        borderColor: colors.border,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: colors.card,
        overflow: "hidden",
      }}
    >
      {title ? (
        <View
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          }}
        >
          <AppText variant="label" weight="700">
            {title}
          </AppText>
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.muted,
              paddingHorizontal: spacing.sm,
            }}
          >
            {columns.map((column, index) => (
              <View
                key={`${column}-${index}`}
                style={{
                  width: columnWidth,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.sm,
                }}
              >
                <AppText
                  variant="micro"
                  weight="700"
                  color={colors.mutedForeground}
                  numberOfLines={1}
                  style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  {column}
                </AppText>
              </View>
            ))}
          </View>

          {rows.map((row, rowIndex) => (
            <View
              key={`row-${rowIndex}`}
              style={{
                flexDirection: "row",
                paddingHorizontal: spacing.sm,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
              }}
            >
              {columns.map((_, cellIndex) => (
                <View
                  key={`cell-${rowIndex}-${cellIndex}`}
                  style={{
                    width: columnWidth,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.sm,
                  }}
                >
                  <AppText variant="caption" numberOfLines={3}>
                    {row[cellIndex] ?? ""}
                  </AppText>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function BlockCard({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { colors, radius, spacing } = useAppTheme();

  return (
    <View
      style={{
        borderColor: colors.border,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: colors.card,
        padding: spacing.md,
        gap: 8,
      }}
    >
      {title || description ? (
        <View style={{ gap: 1, marginBottom: 2 }}>
          {title ? (
            <AppText variant="label" weight="700">
              {title}
            </AppText>
          ) : null}
          {description ? (
            <AppText variant="micro" color={colors.mutedForeground}>
              {description}
            </AppText>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

function Artifact({
  title,
  kind,
  content,
  description,
  language,
}: {
  title: string;
  kind?: string;
  content: string;
  description?: string;
  language?: string;
}) {
  const { colors, radius, spacing } = useAppTheme();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(content);
    setCopied(true);
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    ).catch(() => undefined);
    setTimeout(() => setCopied(false), 1800);
  };

  const share = async () => {
    try {
      await Share.share({ title, message: content });
    } catch {
      // Sharing can be cancelled; no error state is needed.
    }
  };

  return (
    <View
      style={{
        borderColor: colors.border,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: colors.card,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          padding: spacing.md,
          backgroundColor: colors.muted,
        }}
      >
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: radius.xs,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FileText size={15} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <AppText variant="label" weight="700" numberOfLines={1}>
            {title}
          </AppText>
          <AppText
            variant="micro"
            color={colors.mutedForeground}
            numberOfLines={1}
          >
            {[kind?.toUpperCase(), language?.toUpperCase(), description]
              .filter(Boolean)
              .join(" · ") || "Artifact"}
          </AppText>
        </View>
        <Badge label="Artifact" tone="info" dot={false} />
      </View>

      <View style={{ maxHeight: 230 }}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: spacing.md }}
        >
          <AppText
            variant="caption"
            style={{ fontFamily: fonts.mono, lineHeight: 18 }}
          >
            {content}
          </AppText>
        </ScrollView>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: spacing.lg,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copy artifact"
          onPress={copy}
          style={styles.action}
        >
          <Copy size={14} color={colors.primary} />
          <AppText variant="micro" weight="600" color={colors.primary}>
            {copied ? "Copied" : "Copy"}
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share artifact"
          onPress={share}
          style={styles.action}
        >
          <Share2 size={14} color={colors.primary} />
          <AppText variant="micro" weight="600" color={colors.primary}>
            Share
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function Approval({
  title,
  description,
  amount,
  status,
  reference,
  note,
}: {
  title: string;
  description: string;
  amount?: string;
  status: string;
  reference?: string;
  note?: string;
}) {
  const { colors, radius, spacing } = useAppTheme();
  const meta = approvalMeta(status, colors);

  return (
    <View
      style={{
        borderColor: meta.border,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: colors.card,
        padding: spacing.md,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <ApprovalIcon status={status} color={meta.foreground} />
        <AppText variant="label" weight="700" style={{ flex: 1 }}>
          {title}
        </AppText>
        <Badge label={meta.label} tone={meta.tone} />
      </View>

      <AppText variant="caption" color={colors.mutedForeground} style={{ lineHeight: 18 }}>
        {description}
      </AppText>

      {amount ? (
        <AppText
          style={{
            fontSize: 22,
            lineHeight: 28,
            fontWeight: "700",
            letterSpacing: -0.5,
          }}
        >
          {amount}
        </AppText>
      ) : null}

      {reference ? (
        <AppText variant="micro" color={colors.mutedForeground}>
          Reference · {reference}
        </AppText>
      ) : null}

      {note ? (
        <View
          style={{
            backgroundColor: colors.muted,
            borderRadius: radius.xs,
            padding: spacing.sm,
          }}
        >
          <AppText variant="micro" color={colors.mutedForeground}>
            {note}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function Timeline({
  title,
  items,
}: {
  title?: string;
  items: {
    title: string;
    description?: string;
    date?: string;
    tone?: string;
  }[];
}) {
  const { colors, spacing } = useAppTheme();
  const visible = items.filter((item) => item.title);

  if (visible.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        borderColor: colors.border,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: colors.card,
        padding: spacing.md,
        gap: spacing.sm,
      }}
    >
      {title ? (
        <AppText variant="label" weight="700" style={{ marginBottom: 2 }}>
          {title}
        </AppText>
      ) : null}

      {visible.map((item, index) => {
        const palette = tonePalette(item.tone ?? "info", colors);
        const last = index === visible.length - 1;

        return (
          <View key={`${item.title}-${index}`} style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ alignItems: "center", width: 12 }}>
              <View
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: palette.foreground,
                  marginTop: 4,
                }}
              />
              {!last ? (
                <View
                  style={{
                    flex: 1,
                    width: 1.5,
                    backgroundColor: colors.border,
                    marginTop: 3,
                    minHeight: 22,
                  }}
                />
              ) : null}
            </View>
            <View style={{ flex: 1, gap: 1, paddingBottom: last ? 0 : 10 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <AppText variant="bodySmall" weight="600" style={{ flex: 1 }}>
                  {item.title}
                </AppText>
                {item.date ? (
                  <AppText variant="micro" color={colors.mutedForeground}>
                    {item.date}
                  </AppText>
                ) : null}
              </View>
              {item.description ? (
                <AppText variant="micro" color={colors.mutedForeground} style={{ lineHeight: 16 }}>
                  {item.description}
                </AppText>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isElement(
  value: ResolvedOpenUIValue | undefined
): value is Extract<ResolvedOpenUIValue, { kind: "element" }> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "kind" in value &&
    value.kind === "element"
  );
}

function text(value: ResolvedOpenUIValue | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(text).filter(Boolean).join(", ");
  }

  return "";
}

function optionalText(value: ResolvedOpenUIValue | undefined): string | undefined {
  const result = text(value);

  return result || undefined;
}

function stringify(value: ResolvedOpenUIValue): string {
  return text(value);
}

function stringArray(value: ResolvedOpenUIValue | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => text(item)).filter(Boolean);
}

function rowsOf(value: ResolvedOpenUIValue | undefined): string[][] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(Array.isArray)
    .map((row) => (row as ResolvedOpenUIValue[]).map((cell) => text(cell)));
}

function elementsOf(
  value: ResolvedOpenUIValue | undefined
): ResolvedOpenUIValue[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === undefined || value === null) {
    return [];
  }

  return [value];
}

function tone(value: ResolvedOpenUIValue | undefined): string | undefined {
  const result = text(value);

  return result || undefined;
}

function tonePalette(toneName: string, colors: ThemeColors) {
  switch (toneName) {
    case "success":
      return {
        background: colors.successSoft,
        foreground: colors.success,
        border: colors.success + "33",
      };
    case "warning":
      return {
        background: colors.warningSoft,
        foreground: colors.warning,
        border: colors.warning + "33",
      };
    case "danger":
      return {
        background: colors.destructiveSoft,
        foreground: colors.destructive,
        border: colors.destructive + "33",
      };
    case "info":
      return {
        background: colors.primarySoft,
        foreground: colors.primary,
        border: colors.primary + "33",
      };
    case "muted":
      return {
        background: colors.muted,
        foreground: colors.mutedForeground,
        border: colors.border,
      };
    case "default":
    default:
      return {
        background: colors.card,
        foreground: colors.foreground,
        border: colors.border,
      };
  }
}

function ToneIcon({ tone: toneName, color }: { tone: string; color: string }) {
  switch (toneName) {
    case "success":
      return <CheckCircle2 size={16} color={color} strokeWidth={2} />;
    case "warning":
    case "danger":
      return <AlertTriangle size={16} color={color} strokeWidth={2} />;
    case "muted":
    case "info":
    default:
      return <Info size={16} color={color} strokeWidth={2} />;
  }
}

function ApprovalIcon({ status, color }: { status: string; color: string }) {
  switch (status) {
    case "approved":
      return <ShieldCheck size={18} color={color} strokeWidth={2} />;
    case "rejected":
      return <XCircle size={18} color={color} strokeWidth={2} />;
    case "pending":
      return <Clock3 size={18} color={color} strokeWidth={2} />;
    default:
      return <Info size={18} color={color} strokeWidth={2} />;
  }
}

function approvalMeta(status: string, colors: ThemeColors) {
  switch (status) {
    case "approved":
      return {
        label: "Approved",
        tone: "success" as const,
        foreground: colors.success,
        border: colors.success + "33",
      };
    case "rejected":
      return {
        label: "Rejected",
        tone: "danger" as const,
        foreground: colors.destructive,
        border: colors.destructive + "33",
      };
    case "info":
      return {
        label: "Information",
        tone: "info" as const,
        foreground: colors.primary,
        border: colors.primary + "33",
      };
    case "pending":
    default:
      return {
        label: "Pending",
        tone: "warning" as const,
        foreground: colors.warning,
        border: colors.warning + "33",
      };
  }
}

const styles = StyleSheet.create({
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
});
