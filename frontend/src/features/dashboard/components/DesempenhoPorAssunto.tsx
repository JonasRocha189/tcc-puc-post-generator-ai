import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFormat } from "@/lib/format";
import { useTranslation } from "react-i18next";
import { AMOSTRA_MINIMA, amostraSuficiente, taxaEngajamento } from "../metrics";
import type { MetricasGrupo } from "../types";
import DashboardCard from "./DashboardCard";

const th =
  "py-3 text-start text-theme-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400";
const td = "py-3 text-theme-sm text-gray-600 dark:text-gray-400";
// Colunas numéricas: espaço à esquerda para não colarem no celular
const num = "ps-4 text-end whitespace-nowrap";

export default function DesempenhoPorAssunto({
  porAssunto,
}: {
  porAssunto: MetricasGrupo[];
}) {
  const { t } = useTranslation("app", { keyPrefix: "dashboard.bySubject" });
  const fmt = useFormat();
  const linhas = [...porAssunto].sort(
    (a, b) => taxaEngajamento(b) - taxaEngajamento(a),
  );

  return (
    <DashboardCard
      title={t("title")}
      subtitle={t("subtitle", { min: AMOSTRA_MINIMA })}
    >
      <div className="max-w-full overflow-x-auto">
        <Table className="min-w-[28rem]">
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className={th}>
                {t("subject")}
              </TableCell>
              <TableCell isHeader className={`${th} ${num}`}>
                {t("posts")}
              </TableCell>
              <TableCell isHeader className={`${th} ${num}`}>
                {t("impressions")}
              </TableCell>
              <TableCell isHeader className={`${th} ${num}`}>
                {t("engagement")}
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {linhas.map((linha) => (
              <TableRow key={linha.grupo}>
                <TableCell className={`${td} pe-4`}>
                  <span className="font-medium text-gray-800 dark:text-white/90">
                    {linha.grupo}
                  </span>
                  {!amostraSuficiente(linha.posts) && (
                    <span className="ms-2 inline-block">
                      <Badge color="warning" size="sm">
                        {t("insufficient")}
                      </Badge>
                    </span>
                  )}
                </TableCell>
                <TableCell className={`${td} ${num}`}>
                  {fmt.number(linha.posts)}
                </TableCell>
                <TableCell className={`${td} ${num}`}>
                  {fmt.number(linha.impressoes)}
                </TableCell>
                <TableCell className={`${td} ${num} font-medium`}>
                  {fmt.percent(taxaEngajamento(linha))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardCard>
  );
}
