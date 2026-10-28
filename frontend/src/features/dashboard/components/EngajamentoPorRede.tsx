import { useTheme } from "@/context/ThemeContext";
import { REDE_LABEL, type Rede } from "@/lib/dominio";
import { useFormat } from "@/lib/format";
import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { taxaEngajamento } from "../metrics";
import type { MetricasGrupo } from "../types";
import DashboardCard from "./DashboardCard";

export default function EngajamentoPorRede({
  porRede,
}: {
  porRede: (MetricasGrupo & { grupo: Rede })[];
}) {
  const { theme } = useTheme();
  const { t } = useTranslation("app", { keyPrefix: "dashboard.byNetwork" });
  const fmt = useFormat();

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      background: "transparent",
    },
    theme: { mode: theme },
    colors: ["#465fff", "#9cb9ff", "#12b76a", "#fdb022"],
    plotOptions: {
      bar: { horizontal: false, columnWidth: "45%", borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: porRede.map(
        (r) => `${REDE_LABEL[r.grupo]} (${fmt.percent(taxaEngajamento(r))})`,
      ),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { formatter: (v: number) => fmt.number(v) } },
    legend: { position: "top", horizontalAlign: "left" },
    grid: { borderColor: theme === "dark" ? "#1d2939" : "#e4e7ec" },
    tooltip: { y: { formatter: (v: number) => fmt.number(v) } },
  };

  const series = [
    { name: t("likes"), data: porRede.map((r) => r.curtidas) },
    { name: t("comments"), data: porRede.map((r) => r.comentarios) },
    { name: t("shares"), data: porRede.map((r) => r.compartilhamentos) },
    { name: t("clicks"), data: porRede.map((r) => r.cliques) },
  ];

  return (
    <DashboardCard title={t("title")} subtitle={t("subtitle")}>
      <ReactApexChart options={options} series={series} type="bar" height={300} />
    </DashboardCard>
  );
}
