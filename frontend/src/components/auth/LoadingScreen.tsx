import { useTranslation } from "react-i18next";

export default function LoadingScreen({ message }: { message?: string }) {
  const { t } = useTranslation("app");

  return (
    <div
      role="status"
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-gray-900"
    >
      <span className="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-800 dark:border-t-brand-400" />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {message ?? t("common.loading")}
      </p>
    </div>
  );
}
