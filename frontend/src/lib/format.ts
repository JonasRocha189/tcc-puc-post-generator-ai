import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/** Formatadores de número e data no idioma atual da interface. */
export function useFormat() {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;

  return useMemo(() => {
    const numberFmt = new Intl.NumberFormat(locale);
    const percentFmt = new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    const relativeFmt = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    return {
      locale,
      number: (n: number) => numberFmt.format(n),
      percent: (n: number) => percentFmt.format(n),
      date: (value: Date | string, options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat(locale, options).format(new Date(value)),
      /** "há 5 minutos", "ontem", "in 2 days"... */
      relative: (value: Date | string) => {
        const minutes = Math.round(
          (new Date(value).getTime() - Date.now()) / 60_000,
        );
        if (Math.abs(minutes) < 60) return relativeFmt.format(minutes, "minute");
        const hours = Math.round(minutes / 60);
        if (Math.abs(hours) < 24) return relativeFmt.format(hours, "hour");
        return relativeFmt.format(Math.round(hours / 24), "day");
      },
      /** Dias da semana abreviados, começando no domingo. */
      weekdaysShort: () =>
        Array.from({ length: 7 }, (_, i) =>
          new Intl.DateTimeFormat(locale, { weekday: "short" })
            .format(new Date(2024, 0, 7 + i)) // 07/01/2024 foi domingo
            .replace(".", ""),
        ),
    };
  }, [locale]);
}
