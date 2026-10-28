import GridShape from "@/components/common/GridShape";
import PageMeta from "@/components/common/PageMeta";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

interface NotFoundProps {
  className?: string;
}

export default function NotFound({ className }: NotFoundProps) {
  const { t } = useTranslation("app", { keyPrefix: "notFound" });

  return (
    <>
      <PageMeta title={`${t("metaTitle")} | PostPilot`} description={t("message")} />
      <div
        className={cn(
          "relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white p-6 dark:bg-gray-900",
          className,
        )}
      >
        <GridShape />
        <div className="mx-auto w-full max-w-lg text-center">
          <div className="mx-auto mb-8 max-w-60.5 sm:max-w-80">
            <img src="/images/error/404.svg" alt="404" className="dark:hidden" />
            <img
              src="/images/error/404-dark.svg"
              alt="404"
              className="hidden dark:block"
            />
          </div>

          <h1 className="text-title-sm font-bold text-gray-800 sm:text-title-md dark:text-white/90">
            {t("title")}
          </h1>

          <p className="mt-4 mb-6 text-base text-gray-700 sm:text-lg dark:text-gray-400">
            {t("message")}
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
          >
            {t("back")}
          </Link>
        </div>
        {/* <!-- Footer --> */}
        <p className="absolute inset-s-1/2 bottom-6 -translate-x-1/2 text-center text-sm text-gray-500 rtl:translate-x-1/2 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - PostPilot
        </p>
      </div>
    </>
  );
}
