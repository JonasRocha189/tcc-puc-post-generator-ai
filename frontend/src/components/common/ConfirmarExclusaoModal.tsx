import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api/http";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Confirmação de exclusão. Mostra `conflictMessage` quando a API responde
 * 409 (o registro ainda tem dependentes) e uma mensagem genérica nos demais erros.
 */
export default function ConfirmarExclusaoModal({
  isOpen,
  title,
  message,
  conflictMessage,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  conflictMessage?: string;
  onConfirm: () => Promise<unknown>;
  onClose: () => void;
}) {
  const { t } = useTranslation("app", { keyPrefix: "deleteDialog" });
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const fechar = () => {
    setErro(null);
    onClose();
  };

  const confirmar = async () => {
    setPending(true);
    setErro(null);
    try {
      await onConfirm();
      fechar();
    } catch (error) {
      setErro(
        error instanceof ApiError && error.status === 409 && conflictMessage
          ? conflictMessage
          : t("failed"),
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={fechar} className="m-4 max-w-[460px] p-6 sm:p-8">
      <div>
        <h3 className="pe-8 text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h3>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{message}</p>

        {erro && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-error-500 bg-error-50 p-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400"
          >
            {erro}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" size="sm" onClick={fechar}>
            {t("cancel")}
          </Button>
          <Button
            size="sm"
            onClick={confirmar}
            disabled={pending}
            className="bg-error-500! hover:bg-error-600! disabled:bg-error-300!"
          >
            {pending ? t("deleting") : t("confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
