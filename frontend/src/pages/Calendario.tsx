import PageMeta from "@/components/common/PageMeta";
import PostDetailsModal from "@/features/calendario/components/PostDetailsModal";
import PostsCalendar from "@/features/calendario/components/PostsCalendar";
import { postsAgendadosMock } from "@/features/calendario/mock";
import { NIVEL_COR, STATUS_NIVEL } from "@/features/calendario/status";
import type { PostAgendado } from "@/features/calendario/types";
import type { StatusPost } from "@/lib/dominio";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Calendario() {
  const { t } = useTranslation("app");
  const [selecionado, setSelecionado] = useState<PostAgendado | null>(null);
  // TODO: trocar por GET /posts?de=…&ate=… (features/calendario/api.ts) quando a API existir
  const posts = postsAgendadosMock;

  return (
    <>
      <PageMeta
        title={`${t("calendar.title")} | PostPilot`}
        description={t("calendar.metaDescription")}
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {t("calendar.title")}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("calendar.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {(Object.keys(STATUS_NIVEL) as StatusPost[]).map((status) => (
              <li
                key={status}
                className="flex items-center gap-1.5 text-theme-xs text-gray-600 dark:text-gray-400"
              >
                <span
                  className={`size-2.5 rounded-full ${NIVEL_COR[STATUS_NIVEL[status]]}`}
                />
                {t(`domain.postStatus.${status}`)}
              </li>
            ))}
          </ul>
          <span className="rounded-full bg-warning-50 px-3 py-1 text-theme-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
            {t("common.sampleData")}
          </span>
        </div>
      </div>

      <PostsCalendar posts={posts} onSelect={setSelecionado} />
      <PostDetailsModal post={selecionado} onClose={() => setSelecionado(null)} />
    </>
  );
}
