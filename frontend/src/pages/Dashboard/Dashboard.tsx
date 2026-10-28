import PageMeta from "@/components/common/PageMeta";
import DesempenhoPorAssunto from "@/features/dashboard/components/DesempenhoPorAssunto";
import EngajamentoPorRede from "@/features/dashboard/components/EngajamentoPorRede";
import MelhorDiaHorario from "@/features/dashboard/components/MelhorDiaHorario";
import ProximosPosts from "@/features/dashboard/components/ProximosPosts";
import ResumoCards from "@/features/dashboard/components/ResumoCards";
import UltimasExecucoes from "@/features/dashboard/components/UltimasExecucoes";
import { dashboardMock } from "@/features/dashboard/mock";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation("app");
  // TODO: trocar pelos hooks de features/dashboard/api.ts quando a API existir
  const dados = dashboardMock;

  return (
    <>
      <PageMeta
        title={`${t("dashboard.title")} | PostPilot`}
        description={t("dashboard.metaDescription")}
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {t("dashboard.title")}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <span className="rounded-full bg-warning-50 px-3 py-1 text-theme-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
          {t("common.sampleData")}
        </span>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <ResumoCards
            postsPorStatus={dados.postsPorStatus}
            porRede={dados.desempenho.porRede}
          />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <EngajamentoPorRede porRede={dados.desempenho.porRede} />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <MelhorDiaHorario celulas={dados.desempenho.porDiaHorario} />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <DesempenhoPorAssunto porAssunto={dados.desempenho.porAssunto} />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <ProximosPosts posts={dados.proximosPosts} />
        </div>

        <div className="col-span-12">
          <UltimasExecucoes execucoes={dados.ultimasExecucoes} />
        </div>
      </div>
    </>
  );
}
