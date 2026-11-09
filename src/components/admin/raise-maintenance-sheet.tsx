import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { CalendarDays, IndianRupee } from "lucide-react-native";
import { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AlertBanner } from "@/components/common/alert-banner";
import { AppText } from "@/components/common/app-text";
import { Avatar } from "@/components/common/avatar";
import { Button } from "@/components/common/button";
import { Sheet } from "@/components/common/sheet";
import { TextField } from "@/components/common/text-field";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { AdminUser } from "@/types/api";
import { formatDate } from "@/utils/format";

type RaiseMaintenanceSheetProps = {
  visible: boolean;
  users: AdminUser[];
  onClose: () => void;
  onSubmit: (input: { userId: string; amount: number; dueDate: string }) => void;
  loading: boolean;
  error?: string;
};

function startOfToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return now;
}

export function RaiseMaintenanceSheet({
  visible,
  users,
  onClose,
  onSubmit,
  loading,
  error,
}: RaiseMaintenanceSheetProps) {
  const { colors, radius, spacing } = useAppTheme();
  const [selectedId, setSelectedId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState<Date>(startOfToday());
  const [showPicker, setShowPicker] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const residents = users.filter((user) => user.role === "resident");
  const parsedAmount = Number(amount.replace(/[^0-9.]/g, ""));

  const submit = () => {
    if (!selectedId) {
      setLocalError("Select a resident.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setLocalError("Enter an amount greater than zero.");
      return;
    }

    setLocalError(null);
    onSubmit({
      userId: selectedId,
      amount: Math.round(parsedAmount * 100) / 100,
      dueDate: dueDate.toISOString(),
    });
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (event.type === "set" && date) {
      setDueDate(date);
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={loading ? () => undefined : onClose}
      title="Raise maintenance"
      description="Create a new maintenance bill for a resident."
      footer={
        <Button
          label="Create bill"
          onPress={submit}
          loading={loading}
          disabled={residents.length === 0}
        />
      }
    >
      <View style={{ gap: spacing.sm }}>
        <AppText variant="label" color={colors.mutedForeground}>
          Resident
        </AppText>

        {residents.length === 0 ? (
          <AppText variant="caption" color={colors.mutedForeground}>
            There are no residents to bill yet.
          </AppText>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          >
            {residents.map((resident) => {
              const selected = resident._id === selectedId;

              return (
                <Pressable
                  key={resident._id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={resident.name}
                  onPress={() => {
                    setSelectedId(resident._id);
                    setLocalError(null);
                  }}
                  style={[
                    styles.residentChip,
                    {
                      backgroundColor: selected ? colors.primarySoft : colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <Avatar name={resident.name} size={30} tone={selected ? "primary" : "muted"} />
                  <View style={{ gap: 0 }}>
                    <AppText variant="caption" weight="600" numberOfLines={1}>
                      {resident.name}
                    </AppText>
                    <AppText
                      variant="micro"
                      color={colors.mutedForeground}
                      numberOfLines={1}
                      style={{ maxWidth: 120 }}
                    >
                      {resident.address || resident.email}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      <TextField
        label="Amount"
        icon={IndianRupee}
        value={amount}
        onChangeText={setAmount}
        placeholder="4,000"
        keyboardType="decimal-pad"
        helper="The bill starts fully outstanding."
      />

      <View style={{ gap: 6 }}>
        <AppText variant="label" color={colors.mutedForeground}>
          Due date
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose due date"
          onPress={() => setShowPicker((current) => !current)}
          style={[
            styles.dateField,
            {
              backgroundColor: colors.card,
              borderColor: showPicker ? colors.primary : colors.input,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          <CalendarDays size={18} color={colors.primary} />
          <AppText variant="body" style={{ flex: 1 }}>
            {formatDate(dueDate.toISOString())}
          </AppText>
          <AppText variant="caption" color={colors.primary} weight="600">
            {showPicker ? "Close" : "Change"}
          </AppText>
        </Pressable>

        {showPicker ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: radius.md,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.border,
              padding: spacing.sm,
            }}
          >
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onDateChange}
              themeVariant={colors.background === "#0b0f0c" ? "dark" : "light"}
            />
            {Platform.OS === "ios" ? (
              <Button
                label="Done"
                size="sm"
                variant="secondary"
                onPress={() => setShowPicker(false)}
              />
            ) : null}
          </View>
        ) : null}
      </View>

      {localError ? <AlertBanner tone="danger" message={localError} /> : null}
      {error ? <AlertBanner tone="danger" message={error} /> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  residentChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: 190,
  },
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 50,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
